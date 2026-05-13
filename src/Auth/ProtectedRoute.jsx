import {useAuth} from './AuthProvider';

const ProtectedRoute = ({children, fallback, loadingFallback}) => {
	const {loading, user} = useAuth();

	if (loading) {
		return loadingFallback || fallback || null;
	}

	return user ? children : fallback || null;
};

export {ProtectedRoute};