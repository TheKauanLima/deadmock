import {render} from 'preact';

import {Background} from '/src/Background/Background';
import {Config, ConfigContext} from '/src/Common';
import {AuthProvider} from '/src/auth/AuthProvider';
import {ProtectedRoute} from '/src/auth/ProtectedRoute';
import {useAuth} from '/src/auth/useAuth';
import {LoginPage} from '/src/Auth/LoginPage';
import {ImageStorage, ImageStorageContext} from '/src/ImageStorage';
import {PortraitGrid} from '/src/PortraitGrid/PortraitGrid';
import {ModelStorage, ModelStorageContext} from '/src/Serialize';
import {hydrate} from '/src/Serialize/compat';
import {State} from '/src/State';
import '/src/preload';
import '/src/style.css';

const config = new Config({
  baseUrl: import.meta.env.BASE_URL,
});

const fragmentToRaw = () => {
  if (window.location.hash !== '' && window.location.hash !== '#') {
    try {
      const [version, modelData] = JSON.parse(window.atob(window.location.hash.replace('#', '')));
      const result = hydrate(modelData, version);
      window.location.hash = '';
      return result;
    } catch (err) {
      console.error('failed to load model from fragment:', err);
    }
  }
  return null;
};

const imageStorage = new ImageStorage();
const modelStorage = new ModelStorage();
const state = new State(modelStorage, fragmentToRaw());

const AppShell = () => {
	const {logout} = useAuth();

	return (
		<ConfigContext.Provider value={config}>
			<Background state={state} />
			<PortraitGrid state={state} />
			<div className="mock-app-shell-actions">
				<button type="button" className="mock-app-signout" onClick={logout}>
					Sign out
				</button>
			</div>
			<ImageStorageContext.Provider value={imageStorage}>
				<ModelStorageContext.Provider value={modelStorage}>
					{}
				</ModelStorageContext.Provider>
			</ImageStorageContext.Provider>
		</ConfigContext.Provider>
	);
};

const Root = () => (
	<AuthProvider>
		<ProtectedRoute
			fallback={<LoginPage />}
			loadingFallback={<div className="mock-login-screen"><div className="mock-login-panel"><p className="mock-login-message">Loading session...</p></div></div>}
		>
			<AppShell />
		</ProtectedRoute>
	</AuthProvider>
);

const loadFromFragment = () => {
  const raw = fragmentToRaw();
  if (raw) {
    state.loadRaw(raw);
  }
};
window.addEventListener('hashchange', loadFromFragment);

// set CSS variable for scrollbar width for use in styling
const scrollbarWidth = window.innerWidth - document.body.clientWidth;
document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

render(<Root />, document.getElementById('app'));
