import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import App from './app/App';


const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found in the DOM.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
