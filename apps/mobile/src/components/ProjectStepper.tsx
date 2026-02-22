import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii, spacing } from '../theme/tokens';
import { ProgressBar } from './ProgressBar';
import { StatusIndicator } from './StatusIndicator';

type Props = {
  escrowState: string | null | undefined;
  testIDPrefix?: string;
};

const TOTAL_STEPS = 6;

const ISSUE_STATES = new Set([
  'ISSUE_RAISED_HOLD',
  'JOINT_RELEASE_PROPOSED',
  'JOINT_RELEASE_SIGNED',
  'EXTERNAL_RESOLUTION_SUBMITTED',
]);

const COMPLETE_STATES = new Set(['RELEASED_PAID', 'EXECUTED_RELEASE_FULL', 'EXECUTED_RELEASE_PARTIAL', 'EXECUTED_REFUND_FULL', 'EXECUTED_REFUND_PARTIAL']);

function getStepNumber(escrowState: string): number {
  if (escrowState === 'OPEN_FOR_QUOTES') {
    return 1;
  }
  if (escrowState === 'CONTRACTOR_SELECTED') {
    return 2;
  }
  if (escrowState === 'AGREEMENT_ACCEPTED') {
    return 3;
  }
  if (escrowState === 'FUNDED_HELD') {
    return 4;
  }
  if (escrowState === 'COMPLETION_REQUESTED') {
    return 5;
  }
  if (COMPLETE_STATES.has(escrowState)) {
    return 6;
  }
  if (ISSUE_STATES.has(escrowState)) {
    return 5;
  }
  return 1;
}

function getStepLabelKey(step: number, isIssue: boolean): string {
  if (isIssue) {
    return 'project.step.issueRaised';
  }
  switch (step) {
    case 1:
      return 'project.step.quotes';
    case 2:
      return 'project.step.contractorSelected';
    case 3:
      return 'project.step.agreementSigned';
    case 4:
      return 'project.step.escrowFunded';
    case 5:
      return 'project.step.workDone';
    case 6:
      return 'project.step.complete';
    default:
      return 'project.step.quotes';
  }
}

export function ProjectStepper({ escrowState, testIDPrefix = 'project-stepper' }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const normalizedState = String(escrowState ?? '').toUpperCase();
  const isIssue = ISSUE_STATES.has(normalizedState);
  const currentStep = getStepNumber(normalizedState);
  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <View testID={`${testIDPrefix}-container`} style={styles.wrap}>
      <ProgressBar progress={progress} />
      <View style={styles.row}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const step = index + 1;
          if (step < currentStep) {
            return (
              <View key={step} testID={`${testIDPrefix}-dot-${step}`}>
                <StatusIndicator status="completed" />
              </View>
            );
          }
          if (step === currentStep) {
            return (
              <View key={step} testID={`${testIDPrefix}-dot-${step}`}>
                <StatusIndicator status={isIssue ? 'held' : 'in_progress'} />
              </View>
            );
          }
          return <View key={step} testID={`${testIDPrefix}-dot-${step}`} style={styles.futureDot} />;
        })}
      </View>
      <Text testID={`${testIDPrefix}-label`} style={styles.label}>
        {`${t('project.stepOf', { current: currentStep, total: TOTAL_STEPS })} - ${t(getStepLabelKey(currentStep, isIssue))}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  futureDot: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.backgroundSecondary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
});

