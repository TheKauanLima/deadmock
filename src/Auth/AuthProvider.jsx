import {createContext} from 'preact';
import {useContext, useEffect, useMemo, useState} from 'preact/hooks';

import {
	getCurrentSession,
	refreshSession,
	resendVerificationEmail,
	sendPasswordResetEmail,
	signInWithPassword,
	signOut,
	signUpWithPassword,
	updatePassword,
} from '/src/services/auth';

const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
	const [user, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;

		getCurrentSession()
			.then((payload) => {
				if (cancelled) {
					return;
				}

				setUser(payload?.user || null);
				setAccessToken(payload?.accessToken || null);
			})
			.catch((sessionError) => {
				if (!cancelled) {
					setError(sessionError.message || 'Failed to load session.');
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const mutateSession = async (action) => {
		setError(null);
		const payload = await action();

		if (payload && Object.prototype.hasOwnProperty.call(payload, 'user')) {
			setUser(payload.user || null);
		}

		if (payload && Object.prototype.hasOwnProperty.call(payload, 'accessToken')) {
			setAccessToken(payload.accessToken || null);
		}

		return payload;
	};

	const value = useMemo(() => ({
		user,
		accessToken,
		loading,
		error,
		async login(email, password) {
			return mutateSession(() => signInWithPassword(email, password));
		},
		async register(email, password) {
			setError(null);
			return signUpWithPassword(email, password);
		},
		async resendVerification(email) {
			setError(null);
			return resendVerificationEmail(email);
		},
		async requestPasswordReset(email) {
			setError(null);
			return sendPasswordResetEmail(email);
		},
		async resetPassword(token, password) {
			return mutateSession(() => updatePassword(token, password));
		},
		async refresh() {
			return mutateSession(() => refreshSession());
		},
		async logout() {
			setError(null);
			await signOut();
			setUser(null);
			setAccessToken(null);
		},
		clearError() {
			setError(null);
		},
	}), [accessToken, error, loading, user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}

	return context;
};

export {AuthProvider, useAuth};