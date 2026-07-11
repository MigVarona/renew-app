import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Renew, RenewFonts } from '@/constants/renew-theme';
import { Spacing } from '@/constants/theme';
import { useProtocolProgress } from '@/hooks/use-protocol-progress';
import { formatDuration, type HowTo } from '@/lib/articles';
import { ReminderToggle } from './reminder-toggle';

function Checkbox({ checked }: { checked: boolean }) {
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 180 });
    if (checked) {
      scale.value = withSequence(withTiming(1.25, { duration: 90 }), withSpring(1));
    }
  }, [checked, progress, scale]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Renew.mist, Renew.accent]),
    borderColor: interpolateColor(progress.value, [0, 1], [Renew.muted, Renew.dark]),
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.checkbox, boxStyle]}>
      {checked ? (
        <Animated.Text entering={ZoomIn.springify().damping(12)} style={styles.checkmark}>
          ✓
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((done / total) * 100, { duration: 320 });
  }, [done, total, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.trackWrap}>
      <Animated.View style={[styles.trackFill, barStyle]} />
    </View>
  );
}

export function ProtocolCard({ slug, howTo }: { slug: string; howTo: HowTo }) {
  const { done, toggle } = useProtocolProgress(slug);
  const duration = formatDuration(howTo.totalTime);
  const isComplete = done.length === howTo.steps.length;
  const wasComplete = useRef(isComplete);

  const celebration = useSharedValue(1);

  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      celebration.value = withSequence(
        withTiming(1.08, { duration: 160 }),
        withDelay(80, withSpring(1))
      );
    }
    wasComplete.current = isComplete;
  }, [isComplete, celebration]);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebration.value }],
  }));

  function handleToggle(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(index);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{duration ? `Protocol · ${duration}` : 'Protocol'}</Text>
      <Text style={styles.name}>{howTo.name}</Text>
      <Text style={styles.description}>{howTo.description}</Text>

      <ProgressBar done={done.length} total={howTo.steps.length} />

      <View style={styles.steps}>
        {howTo.steps.map((step, index) => {
          const checked = done.includes(index);

          return (
            <Pressable
              key={step.name}
              onPress={() => handleToggle(index)}
              style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}>
              <Checkbox checked={checked} />
              <View style={styles.stepBody}>
                <Text style={[styles.stepName, checked && styles.stepNameDone]}>{step.name}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Animated.Text
        style={[styles.progress, isComplete && styles.progressDone, celebrationStyle]}>
        {isComplete ? '✓ Completed today' : `${done.length} of ${howTo.steps.length} · today`}
      </Animated.Text>

      <ReminderToggle slug={slug} title={howTo.name} body={howTo.description} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Renew.mist,
    borderLeftWidth: 4,
    borderLeftColor: Renew.accent,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
  name: {
    fontFamily: RenewFonts.serif,
    fontSize: 24,
    lineHeight: 30,
    color: Renew.dark,
  },
  description: {
    fontFamily: RenewFonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: Renew.muted,
  },
  trackWrap: {
    marginTop: Spacing.three,
    height: 5,
    borderRadius: 3,
    backgroundColor: Renew.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Renew.sage,
  },
  steps: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepPressed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: Renew.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkmark: {
    fontSize: 14,
    lineHeight: 18,
    color: Renew.dark,
    fontFamily: RenewFonts.bold,
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  stepName: {
    fontFamily: RenewFonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: Renew.dark,
  },
  stepNameDone: {
    color: Renew.muted,
    textDecorationLine: 'line-through',
  },
  stepText: {
    fontFamily: RenewFonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Renew.muted,
  },
  progress: {
    marginTop: Spacing.three,
    fontSize: 12,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Renew.muted,
  },
  progressDone: {
    color: Renew.sage,
  },
});
