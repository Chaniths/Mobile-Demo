import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FLOW_STEP_LABELS } from '../../utils/fieldAdminQualityFlow';

const FieldAdminFlowStepper = ({ currentStep = 1 }) => {
  const { theme } = useTheme();
  const activeColor = theme.isDarkMode ? theme.colors.teal.main : theme.colors.primary.main;

  return (
    <View style={styles.container}>
      {FLOW_STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
        return (
          <View key={label} style={styles.stepWrap}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive || isComplete ? activeColor : theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.dotText, { color: isActive || isComplete ? '#fff' : theme.colors.text.tertiary }]}>
                {step}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? activeColor : theme.colors.text.secondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {index < FLOW_STEP_LABELS.length - 1 ? (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: isComplete ? activeColor : theme.colors.border },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: 13,
    left: '58%',
    width: '84%',
    height: 2,
    zIndex: -1,
  },
});

export default FieldAdminFlowStepper;
