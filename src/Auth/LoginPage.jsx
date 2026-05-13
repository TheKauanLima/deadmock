import {useEffect, useState} from 'preact/hooks';

import {useAuth} from '/src/auth/useAuth';

import './LoginPage.css';

const emptyForm = {email: '', password: '', confirmPassword: ''};

const getInitialMode = () => {
	const searchParams = new URLSearchParams(window.location.search);
	return searchParams.get('reset_token') ? 'reset' : 'signin';
};

const LoginPage = () => {
	const {login, register, requestPasswordReset, resendVerification, resetPassword, error, clearError} = useAuth();
	const [mode, setMode] = useState(getInitialMode);
	const [form, setForm] = useState(emptyForm);
	const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('reset_token') || '');
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('verified') === '1') {
			setMessage('Email verified. You can sign in now.');
			window.history.replaceState({}, '', window.location.pathname);
		}
	}, []);

	useEffect(() => {
		if (mode === 'reset') {
			setResetToken(new URLSearchParams(window.location.search).get('reset_token') || '');
		}
	}, [mode]);

	const updateField = (field) => (ev) => {
		setForm((current) => ({...current, [field]: ev.currentTarget.value}));
	};

	const handleSubmit = async (ev) => {
		ev.preventDefault();
		setMessage('');
		clearError();
		setIsSubmitting(true);

		try {
			if (mode === 'signup') {
				if (form.password !== form.confirmPassword) {
					throw new Error('Passwords do not match.');
				}

				await register(form.email.trim(), form.password);
				setMessage('Account created. Check your inbox to verify your email.');
				setMode('signin');
				setForm(emptyForm);
				return;
			}

			if (mode === 'forgot') {
				await requestPasswordReset(form.email.trim());
				setMessage('If the account exists, a password reset email has been sent.');
				setMode('signin');
				setForm(emptyForm);
				return;
			}

			if (mode === 'reset') {
				if (!resetToken) {
					throw new Error('Reset token missing from the URL.');
				}

				if (form.password !== form.confirmPassword) {
					throw new Error('Passwords do not match.');
				}

				await resetPassword(resetToken, form.password);
				setMessage('Password updated. You are now signed in.');
				window.history.replaceState({}, '', window.location.pathname);
				return;
			}

			await login(form.email.trim(), form.password);
		} catch (submitError) {
			setMessage(submitError?.message || 'Authentication failed.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendVerification = async () => {
		if (!form.email.trim()) {
			setMessage('Enter your email first.');
			return;
		}

		setMessage('');
		clearError();
		setIsSubmitting(true);

		try {
			await resendVerification(form.email.trim());
			setMessage('If the account exists, a verification email has been sent.');
		} catch (submitError) {
			setMessage(submitError?.message || 'Unable to resend verification email.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mock-login-screen">
			<div className="mock-login-panel">
				<div className="mock-login-copy">
					<p className="mock-login-kicker">Deadmock</p>
					<h1>{mode === 'signup' ? 'Create an account' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Sign in'}</h1>
					<p>
						Anyone can create an account. Verify your email once, then sign in whenever you need to use the site.
					</p>
				</div>

				<form className="mock-login-form" onSubmit={handleSubmit}>
					{mode !== 'reset' && (
						<label>
							<span>Email</span>
							<input type="email" value={form.email} onInput={updateField('email')} autoComplete="email" required />
						</label>
					)}

					{mode !== 'forgot' && mode !== 'reset' && (
						<label>
							<span>Password</span>
							<input
								type="password"
								value={form.password}
								onInput={updateField('password')}
								autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
								required
							/>
						</label>
					)}

					{mode === 'forgot' && <p className="mock-login-message">Enter your email address and we will send a reset link.</p>}

					{(mode === 'signup' || mode === 'reset') && (
						<label>
							<span>Confirm password</span>
							<input type="password" value={form.confirmPassword} onInput={updateField('confirmPassword')} autoComplete="new-password" required />
						</label>
					)}

					{mode === 'reset' && (
						<label>
							<span>Reset token</span>
							<input type="text" value={resetToken} readOnly />
						</label>
					)}

					<button type="submit" className="mock-login-submit" disabled={isSubmitting}>
						{isSubmitting
							? 'Working...'
							: mode === 'signup'
								? 'Create account'
								: mode === 'forgot'
									? 'Send reset email'
									: mode === 'reset'
										? 'Update password'
										: 'Sign in'}
					</button>

					{mode !== 'reset' && (
						<div className="mock-login-actions">
							{mode !== 'signup' && (
								<button type="button" className="mock-login-toggle" onClick={() => setMode('signup')} disabled={isSubmitting}>
									Create a new account
								</button>
							)}
							{mode !== 'signin' && (
								<button type="button" className="mock-login-toggle" onClick={() => setMode('signin')} disabled={isSubmitting}>
									I already have an account
								</button>
							)}
							{mode !== 'forgot' && (
								<button type="button" className="mock-login-toggle" onClick={() => setMode('forgot')} disabled={isSubmitting}>
									Forgot password?
								</button>
							)}
							<button type="button" className="mock-login-toggle" onClick={handleResendVerification} disabled={isSubmitting}>
								Resend verification
							</button>
						</div>
					)}

					{message && <p className="mock-login-message">{message}</p>}
					{error && <p className="mock-login-message">{error}</p>}
				</form>
			</div>
		</div>
	);
};

export {LoginPage};