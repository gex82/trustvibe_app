import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

export type PickerOption = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string;
  placeholder?: string;
  testID?: string;
  customOptionValue?: string;
  customOptionLabel?: string;
  customInputPlaceholder?: string;
};

export function PickerInput({
  label,
  options,
  value,
  onChange,
  allowCustom = false,
  iconName,
  error,
  placeholder,
  testID,
  customOptionValue = 'other',
  customOptionLabel = 'Other',
  customInputPlaceholder = 'Enter custom value',
}: Props): React.JSX.Element {
  const [visible, setVisible] = React.useState(false);
  const optionValues = React.useMemo(() => new Set(options.map((item) => item.value)), [options]);
  const hasCustomValue = Boolean(value) && !optionValues.has(value);
  const [customDraft, setCustomDraft] = React.useState(hasCustomValue ? value : '');
  const [selectingCustom, setSelectingCustom] = React.useState(hasCustomValue);
  const hasBuiltInCustomOption = React.useMemo(
    () => options.some((item) => item.value === customOptionValue),
    [customOptionValue, options]
  );

  React.useEffect(() => {
    const nextCustom = Boolean(value) && !optionValues.has(value);
    setSelectingCustom(nextCustom);
    if (nextCustom) {
      setCustomDraft(value);
    }
  }, [optionValues, value]);

  const selectedOption = options.find((item) => item.value === value);
  const displayValue = selectedOption?.label ?? (value || placeholder || '');
  const getTestID = React.useCallback(
    (suffix: string): string | undefined => (testID ? `${testID}-${suffix}` : undefined),
    [testID]
  );

  function openPicker(): void {
    setVisible(true);
  }

  function closePicker(): void {
    setVisible(false);
  }

  function selectOption(nextValue: string): void {
    if (allowCustom && nextValue === customOptionValue) {
      setSelectingCustom(true);
      return;
    }

    onChange(nextValue);
    setVisible(false);
  }

  function applyCustomValue(): void {
    const trimmed = customDraft.trim();
    if (!trimmed) {
      return;
    }
    onChange(trimmed);
    setVisible(false);
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        testID={getTestID('picker')}
        style={[styles.inputWrap, error ? styles.inputWrapError : null]}
        onPress={openPicker}
      >
        {iconName ? <Ionicons name={iconName} size={18} color={colors.textSecondary} /> : null}
        <Text style={[styles.value, !displayValue ? styles.placeholder : null]}>
          {displayValue || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={closePicker}>
        <Pressable style={styles.overlay} onPress={closePicker}>
          <Pressable
            testID={getTestID('modal')}
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView contentContainerStyle={styles.optionsWrap}>
              {options.map((item) => (
                <Pressable
                  key={item.value}
                  testID={getTestID(`option-${item.value}`)}
                  style={[
                    styles.option,
                    value === item.value ? styles.optionSelected : null,
                  ]}
                  onPress={() => selectOption(item.value)}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
                </Pressable>
              ))}
              {allowCustom && !hasBuiltInCustomOption ? (
                <Pressable
                  testID={getTestID(`option-${customOptionValue}`)}
                  style={styles.option}
                  onPress={() => selectOption(customOptionValue)}
                >
                  <Text style={styles.optionLabel}>{customOptionLabel}</Text>
                </Pressable>
              ) : null}
            </ScrollView>
            {allowCustom && selectingCustom ? (
              <View style={styles.customWrap}>
                <TextInput
                  testID={getTestID('custom-input')}
                  value={customDraft}
                  onChangeText={setCustomDraft}
                  placeholder={customInputPlaceholder}
                  placeholderTextColor={colors.textSecondary}
                  style={styles.customInput}
                />
                <Pressable
                  testID={getTestID('custom-submit')}
                  style={[styles.customButton, !customDraft.trim() ? styles.customButtonDisabled : null]}
                  onPress={applyCustomValue}
                  disabled={!customDraft.trim()}
                >
                  <Text style={styles.customButtonLabel}>{customOptionLabel}</Text>
                </Pressable>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 36, 64, 0.45)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    maxHeight: '80%',
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  optionsWrap: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  optionSelected: {
    borderColor: colors.navyLight,
    backgroundColor: '#EAF0FB',
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  customWrap: {
    gap: spacing.xs,
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customButton: {
    borderRadius: radii.md,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  customButtonDisabled: {
    opacity: 0.6,
  },
  customButtonLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
