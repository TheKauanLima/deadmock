const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const jsonHeaders = {'Content-Type': 'application/json'};

const parseResponse = async (response) => {
	const contentType = response.headers.get('content-type') || '';
	const payload = contentType.includes('application/json') ? await response.json() : await response.text();

	if (!response.ok) {
		const error = new Error(payload?.error || payload?.message || 'Request failed');
		error.code = payload?.code;
		error.status = response.status;
		error.payload = payload;
		throw error;
	}

	return payload;
};

const request = async (path, options = {}) => {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		headers: {
			...jsonHeaders,
			...(options.headers || {}),
		},
		...options,
		body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
	});

	return parseResponse(response);
};

export async function getCurrentSession() {
	return request('/auth/session', {method: 'GET'});
}

export async function signInWithPassword(email, password) {
	return request('/auth/login', {method: 'POST', body: {email, password}});
}

export async function signUpWithPassword(email, password) {
	return request('/auth/register', {method: 'POST', body: {email, password}});
}

export async function resendVerificationEmail(email) {
	return request('/auth/resend-verification', {method: 'POST', body: {email}});
}

export async function sendPasswordResetEmail(email) {
	return request('/auth/forgot-password', {method: 'POST', body: {email}});
}

export async function updatePassword(token, password) {
	return request('/auth/reset-password', {method: 'POST', body: {token, password}});
}

export async function refreshSession() {
	return request('/auth/session', {method: 'GET'});
}

export async function signOut() {
	return request('/auth/logout', {method: 'POST'});
}
