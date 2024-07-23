import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { Provider as RollBarProvider, ErrorBoundary } from '@rollbar/react';
import i18n from './i18n';
import App from './App';
import store from './slices/index.js';
import rollbar from './rollbar';

const root = ReactDOM.createRoot(document.getElementById('chat'));
root.render(
  <Provider store={store}>
    <RollBarProvider config={rollbar}>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ErrorBoundary>
    </RollBarProvider>
  </Provider>,
);
