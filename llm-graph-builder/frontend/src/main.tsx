import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import Auth0ProviderWithHistory from './components/Auth/Auth.tsx';
import App from './App.tsx';
import { SKIP_AUTH } from './utils/Constants.ts';

// Remove splash screen after app loads
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 600);
    }
  }, 1200);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    {SKIP_AUTH ? (
      <App />
    ) : (
      <Auth0ProviderWithHistory>
        <App />
      </Auth0ProviderWithHistory>
    )}
  </BrowserRouter>
);
