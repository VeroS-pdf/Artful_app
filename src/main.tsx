/**
 * Entry point: loads fonts and styles, then mounts <App /> into index.html.
 */
import '@fontsource-variable/nunito';
import '@fontsource-variable/fraunces';

import './styles/theme.css';
import './styles/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
