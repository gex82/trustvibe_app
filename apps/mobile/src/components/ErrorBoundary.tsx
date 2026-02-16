import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import i18n from 'i18next';
import { colors, spacing } from '../theme/tokens';
import { logError, logWarn } from '../services/logger';

type Props = {
  children: React.ReactNode;
  onGoToRoleSelect: () => void | Promise<void>;
};

type State = {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo });
    logError('ui.error_boundary.caught', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private reset = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  private copyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const payload = [
      `name: ${error?.name ?? 'UnknownError'}`,
      `message: ${error?.message ?? 'No message'}`,
      `stack: ${error?.stack ?? 'No stack'}`,
      `componentStack: ${errorInfo?.componentStack ?? 'No component stack'}`,
    ].join('\n');

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        Alert.alert(i18n.t('errorBoundary.copiedTitle'), i18n.t('errorBoundary.copiedBody'));
        return;
      }

      Alert.alert(i18n.t('errorBoundary.detailsTitle'), payload);
    } catch (copyError) {
      logWarn('ui.error_boundary.copy_failed', undefined, copyError);
      Alert.alert(i18n.t('errorBoundary.copyFailedTitle'), i18n.t('errorBoundary.copyFailedBody'));
    }
  };

  render(): React.JSX.Element {
    const { error } = this.state;

    if (!error) {
      return <>{this.props.children}</>;
    }

    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.wrap}>
          <Text style={styles.title}>{i18n.t('errorBoundary.title')}</Text>
          <Text style={styles.description}>{i18n.t('errorBoundary.description')}</Text>
          <View style={styles.card}>
            <Text style={styles.label}>{i18n.t('errorBoundary.errorLabel')}</Text>
            <Text style={styles.message}>{error.message || 'Unknown error'}</Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={this.reset}>
            <Text style={styles.primaryLabel}>{i18n.t('errorBoundary.retry')}</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              void this.props.onGoToRoleSelect();
              this.reset();
            }}
          >
            <Text style={styles.secondaryLabel}>{i18n.t('errorBoundary.goToRoleSelect')}</Text>
          </Pressable>

          <Pressable style={styles.tertiaryButton} onPress={() => void this.copyError()}>
            <Text style={styles.tertiaryLabel}>{i18n.t('errorBoundary.copyError')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  message: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.navy,
  },
  primaryLabel: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  tertiaryButton: {
    minHeight: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  tertiaryLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
