import { Amplify } from 'aws-amplify';
import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import React from 'react';
import AppRoutes from "./routes/AppRoutes";
import '../src/scss/app.scss'

Amplify.configure(config);
export function App({ signOut, user }: WithAuthenticatorProps) {
  return <AppRoutes />
}

export default withAuthenticator(App);
