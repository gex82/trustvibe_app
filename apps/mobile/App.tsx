import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import './src/i18n/polyfills';
import './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { logout } from './src/services/api';
import { useAppStore } from './src/store/appStore';
import { logError } from './src/services/logger';

const queryClient = new QueryClient();

export default function App(): React.JSX.Element {
  const [boundaryKey, setBoundaryKey] = React.useState(0);

  const handleGoToRoleSelect = React.useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      logError('app.error_boundary.logout_failed', error);
    } finally {
      useAppStore.getState().clearSession();
      queryClient.clear();
      setBoundaryKey((value) => value + 1);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary key={boundaryKey} onGoToRoleSelect={handleGoToRoleSelect}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
