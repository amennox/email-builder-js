import React from 'react';

import ReactDOM from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';
import { applyUiTheme, getInitialUiTheme } from '@/lib/theme';

import App from './App';

import './index.css';

applyUiTheme(getInitialUiTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors />
  </React.StrictMode>,
);
