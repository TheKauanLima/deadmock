import 'dotenv/config';

import crypto from 'node:crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import validator from 'validator';

import {pool, withClient} from './db.js';
import {sendPasswordResetEmail, sendVerificationEmail} from './mailer.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const appUrl = process.env.APP_URL || 'http://localhost:5173';
const cookieSecure = process.env.NODE_ENV === 'production';
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const refreshCookieName = 'deadmock_refresh_token';
const refreshTokenTtlSeconds = 7 * 24 * 60 * 60;

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required');
if (!accessSecret || !refreshSecret) throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required');

const loginLimiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false});
const forgotLimiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 4, standardHeaders: true, legacyHeaders: false});
const registerLimiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false});

app.use(helmet());
app.use(cors({origin: appUrl, credentials: true}));
app.use(express.json());
app.use(cookieParser());

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const tokenPayload = (user, kind) => ({sub: user.id, email: user.email, ver: user.token_version, typ: kind});
const signAccessToken = (user) => jwt.sign(tokenPayload(user, 'access'), accessSecret, {expiresIn: '15m'});
const signRefreshToken = (user) => jwt.sign({...tokenPayload(user, 'refresh'), jti: crypto.randomUUID()}, refreshSecret, {expiresIn: '7d'});

const toPublicUser = (row) => ({id: row.id, email: row.email, name: row.name, isVerified: row.is_verified, tokenVersion: row.token_version, createdAt: row.created_at, updatedAt: row.updated_at});

const cookieOptions = {httpOnly: true, secure: cookieSecure, sameSite: 'lax', path: '/', maxAge: refreshTokenTtlSeconds * 1000};
const setRefreshCookie = (res, token) => { res.cookie(refreshCookieName, token, cookieOptions); };
const clearRefreshCookie = (res) => { res.clearCookie(refreshCookieName, cookieOptions); };

const normalizeEmail = (value) => {
	const email = validator.normalizeEmail(String(value || '').trim(), {gmail_remove_dots: false, gmail_remove_subaddress: false});
	if (!email || !validator.isEmail(email)) {
		throw Object.assign(new Error('Enter a valid email address.'), {status: 400, code: 'INVALID_EMAIL'});
	}
	return email.toLowerCase();
};

const normalizePassword = (value) => {
	const password = String(value || '');
	if (password.length < 8) {
		throw Object.assign(new Error('Password must be at least 8 characters long.'), {status: 400, code: 'WEAK_PASSWORD'});
	}
	return password;
};

const issueSession = async (res, user) => {
	const accessToken = signAccessToken(user);
	const refreshToken = signRefreshToken(user);
	await pool.query('update users set refresh_token_hash = $1, refresh_token_expires_at = $2, updated_at = now() where id = $3', [sha256(refreshToken), new Date(Date.now() + refreshTokenTtlSeconds * 1000), user.id]);
	setRefreshCookie(res, refreshToken);
	return {accessToken, user: toPublicUser(user)};
};

const parseBearerToken = (req) => {
	const header = req.headers.authorization || '';
	return header.startsWith('Bearer ') ? header.slice(7) : null;
};

const resolveUserFromAccessToken = async (token) => {
	const decoded = jwt.verify(token, accessSecret);
	const {rows} = await pool.query('select * from users where id = $1', [decoded.sub]);
	const user = rows[0];
	if (!user || user.token_version !== decoded.ver) {
		throw Object.assign(new Error('Session expired.'), {status: 401, code: 'SESSION_EXPIRED'});
	}
	return user;
};

const resolveSession = async (req, res) => {
	const accessToken = parseBearerToken(req);
	if (accessToken) {
		try {
			const user = await resolveUserFromAccessToken(accessToken);
			return {user, accessToken};
		} catch (error) {
			if (error.status !== 401) {
				throw error;
			}
		}
	}

	const refreshToken = req.cookies[refreshCookieName];
	if (!refreshToken) {
		return {user: null, accessToken: null};
	}

	const decoded = jwt.verify(refreshToken, refreshSecret);
	const {rows} = await pool.query('select * from users where id = $1', [decoded.sub]);
	const user = rows[0];
	if (!user || user.token_version !== decoded.ver) {
		throw Object.assign(new Error('Session expired.'), {status: 401, code: 'SESSION_EXPIRED'});
	}

	if (!user.refresh_token_hash || user.refresh_token_hash !== sha256(refreshToken)) {
		throw Object.assign(new Error('Refresh token invalid.'), {status: 401, code: 'INVALID_REFRESH_TOKEN'});
	}

	if (user.refresh_token_expires_at && new Date(user.refresh_token_expires_at).getTime() < Date.now()) {
		throw Object.assign(new Error('Refresh token expired.'), {status: 401, code: 'REFRESH_TOKEN_EXPIRED'});
	}

	return issueSession(res, user);
};

const sendVerificationLink = async (user) => {
	const verifyUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(user.verification_token)}`;
	await sendVerificationEmail({to: user.email, verifyUrl});
};

const sendResetLink = async (user) => {
	const resetUrl = `${appUrl}/?reset_token=${encodeURIComponent(user.reset_token)}`;
	await sendPasswordResetEmail({to: user.email, resetUrl});
};

const upsertUnverifiedUser = async (client, {email, passwordHash, verificationToken, verificationExpiresAt}) => {
	const existing = await client.query('select * from users where email = $1 for update', [email]);
	if (existing.rowCount > 0) {
		const current = existing.rows[0];
		if (current.is_verified) {
			throw Object.assign(new Error('That email already has an account.'), {status: 409, code: 'ACCOUNT_EXISTS'});
		}

		const {rows} = await client.query(`update users set password_hash = $1, verification_token = $2, verification_token_expires_at = $3, reset_token = null, reset_token_expires_at = null, refresh_token_hash = null, refresh_token_expires_at = null, updated_at = now() where id = $4 returning *`, [passwordHash, verificationToken, verificationExpiresAt, current.id]);
		return rows[0];
	}

	const {rows} = await client.query(`insert into users (email, password_hash, is_verified, verification_token, verification_token_expires_at, login_attempts, locked_until, token_version) values ($1, $2, false, $3, $4, 0, null, 0) returning *`, [email, passwordHash, verificationToken, verificationExpiresAt]);
	return rows[0];
};

app.get('/api/health', (_req, res) => res.json({ok: true}));

app.get('/api/auth/session', async (req, res, next) => {
	try {
		const session = await resolveSession(req, res);
		res.json(session.user ? session : {user: null, accessToken: null});
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/register', registerLimiter, async (req, res, next) => {
	try {
		const email = normalizeEmail(req.body.email);
		const password = normalizePassword(req.body.password);
		const passwordHash = await bcrypt.hash(password, 12);
		const verificationToken = crypto.randomUUID();
		const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		const user = await withClient(async (client) => {
			await client.query('begin');
			try {
				const record = await upsertUnverifiedUser(client, {email, passwordHash, verificationToken, verificationExpiresAt});
				await client.query('commit');
				return record;
			} catch (error) {
				await client.query('rollback');
				throw error;
			}
		});

		await sendVerificationLink(user);
		res.status(201).json({message: 'Verification email sent.'});
	} catch (error) {
		next(error);
	}
});

app.get('/api/auth/verify-email', async (req, res, next) => {
	try {
		const token = String(req.query.token || '');
		if (!token) {
			throw Object.assign(new Error('Verification token missing.'), {status: 400, code: 'INVALID_TOKEN'});
		}

		const {rows} = await pool.query('select * from users where verification_token = $1 and verification_token_expires_at > now() limit 1', [token]);
		const user = rows[0];
		if (!user) {
			throw Object.assign(new Error('Verification token expired or invalid.'), {status: 400, code: 'INVALID_TOKEN'});
		}

		await pool.query(`update users set is_verified = true, verification_token = null, verification_token_expires_at = null, token_version = token_version + 1, updated_at = now() where id = $1`, [user.id]);
		res.redirect(`${appUrl}/?verified=1`);
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/resend-verification', registerLimiter, async (req, res, next) => {
	try {
		const email = normalizeEmail(req.body.email);
		const {rows} = await pool.query('select * from users where email = $1 limit 1', [email]);
		const user = rows[0];

		if (user && !user.is_verified) {
			const verificationToken = crypto.randomUUID();
			const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const {rows: updatedRows} = await pool.query(`update users set verification_token = $1, verification_token_expires_at = $2, updated_at = now() where id = $3 returning *`, [verificationToken, verificationExpiresAt, user.id]);
			await sendVerificationLink(updatedRows[0]);
		}

		res.json({message: 'If the account exists, a verification email has been sent.'});
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
	try {
		const email = normalizeEmail(req.body.email);
		const password = String(req.body.password || '');
		const {rows} = await pool.query('select * from users where email = $1 limit 1', [email]);
		const user = rows[0];

		if (!user) {
			throw Object.assign(new Error('Invalid email or password.'), {status: 401, code: 'INVALID_CREDENTIALS'});
		}

		if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
			throw Object.assign(new Error('Account locked. Try again later.'), {status: 423, code: 'ACCOUNT_LOCKED'});
		}

		if (!user.is_verified) {
			throw Object.assign(new Error('Please verify your email before logging in.'), {status: 403, code: 'EMAIL_NOT_VERIFIED'});
		}

		const passwordMatches = await bcrypt.compare(password, user.password_hash);
		if (!passwordMatches) {
			const nextAttempts = Number(user.login_attempts || 0) + 1;
			const lockAccount = nextAttempts >= 5;
			const lockedUntil = lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null;
			await pool.query(`update users set login_attempts = $1, locked_until = $2, updated_at = now() where id = $3`, [nextAttempts, lockedUntil, user.id]);
			throw Object.assign(new Error(lockAccount ? 'Account locked for 30 minutes.' : 'Invalid email or password.'), {status: lockAccount ? 423 : 401, code: lockAccount ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS'});
		}

		const {rows: updatedRows} = await pool.query(`update users set login_attempts = 0, locked_until = null, refresh_token_hash = null, refresh_token_expires_at = null, updated_at = now() where id = $1 returning *`, [user.id]);
		const session = await issueSession(res, updatedRows[0]);
		res.json(session);
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/forgot-password', forgotLimiter, async (req, res, next) => {
	try {
		const email = normalizeEmail(req.body.email);
		const {rows} = await pool.query('select * from users where email = $1 limit 1', [email]);
		const user = rows[0];

		if (user && user.is_verified) {
			const resetToken = crypto.randomUUID();
			const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
			const {rows: updatedRows} = await pool.query(`update users set reset_token = $1, reset_token_expires_at = $2, updated_at = now() where id = $3 returning *`, [resetToken, resetExpiresAt, user.id]);
			await sendResetLink(updatedRows[0]);
		}

		res.json({message: 'If the account exists, a password reset email has been sent.'});
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/reset-password', async (req, res, next) => {
	try {
		const token = String(req.body.token || '').trim();
		const password = normalizePassword(req.body.password);
		const {rows} = await pool.query('select * from users where reset_token = $1 and reset_token_expires_at > now() limit 1', [token]);
		const user = rows[0];
		if (!user) {
			throw Object.assign(new Error('Reset token expired or invalid.'), {status: 400, code: 'INVALID_TOKEN'});
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const {rows: updatedRows} = await pool.query(`update users set password_hash = $1, reset_token = null, reset_token_expires_at = null, login_attempts = 0, locked_until = null, refresh_token_hash = null, refresh_token_expires_at = null, token_version = token_version + 1, updated_at = now() where id = $2 returning *`, [passwordHash, user.id]);
		const session = await issueSession(res, updatedRows[0]);
		res.json(session);
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/logout', async (req, res, next) => {
	try {
		const refreshToken = req.cookies[refreshCookieName];
		if (refreshToken) {
			try {
				const decoded = jwt.verify(refreshToken, refreshSecret);
				await pool.query('update users set refresh_token_hash = null, refresh_token_expires_at = null, updated_at = now() where id = $1', [decoded.sub]);
			} catch (_error) {
				// ignore invalid refresh tokens on logout
			}
		}

		clearRefreshCookie(res);
		res.json({message: 'Signed out.'});
	} catch (error) {
		next(error);
	}
});

app.post('/api/auth/revoke-sessions', async (req, res, next) => {
	try {
		const accessToken = parseBearerToken(req);
		if (!accessToken) {
			throw Object.assign(new Error('Unauthorized.'), {status: 401, code: 'UNAUTHORIZED'});
		}

		const user = await resolveUserFromAccessToken(accessToken);
		const {rows} = await pool.query(`update users set token_version = token_version + 1, refresh_token_hash = null, refresh_token_expires_at = null, updated_at = now() where id = $1 returning *`, [user.id]);
		clearRefreshCookie(res);
		res.json({user: toPublicUser(rows[0])});
	} catch (error) {
		next(error);
	}
});

app.get('/api/heroes/:heroId', async (req, res, next) => {
	try {
		const {heroId} = req.params;
		const {rows} = await pool.query(`
			select
				h.id as hero_id,
				h.name,
				h.owner_id,
				h.visibility,
				c.display_label,
				c.portrait_path,
				c.render_path,
				c.signature_path,
				t.hero_folder,
				t.signature_color,
				t.rectangle_color,
				t.text_labels,
				t.text_color,
				t.ability_color,
				t.circle_color,
				t.ability_icons
			from heroes h
			join hero_catalog c on c.hero_id = h.id
			left join hero_cluster_themes t on t.hero_id = h.id
			where h.name = $1
			limit 1
		`, [heroId]);
		
		if (rows.length === 0) {
			throw Object.assign(new Error('Hero not found.'), {status: 404, code: 'HERO_NOT_FOUND'});
		}
		
		const hero = rows[0];
		res.json({
			id: hero.hero_id,
			label: hero.display_label,
			name: hero.name,
			ownerId: hero.owner_id,
			visibility: hero.visibility,
			portrait: hero.portrait_path,
			render: hero.render_path,
			signature: hero.signature_path,
			theme: {
				heroFolder: hero.hero_folder,
				signatureColor: hero.signature_color,
				rectangleColor: hero.rectangle_color,
				textLabels: hero.text_labels,
				textColor: hero.text_color,
				abilityColor: hero.ability_color,
				circleColor: hero.circle_color,
				abilityIcons: hero.ability_icons,
			},
		});
	} catch (error) {
		next(error);
	}
});

app.use((error, _req, res, _next) => {
	const status = error.status || 500;
	res.status(status).json({error: error.message || 'Internal server error', code: error.code || 'INTERNAL_SERVER_ERROR'});
});

app.listen(port, () => {
	console.log(`Deadmock auth server running on http://localhost:${port}`);
});