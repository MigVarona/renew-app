import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RenewLogo } from '@/components/renew-logo';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Renew, RenewFonts } from '@/constants/renew-theme';
import { useArticles } from '@/hooks/use-articles';
import { formatDuration, onlyProtocols, type Protocol } from '@/lib/articles';
import { formatEditorialDate } from '@/lib/dates';
import { practiceName } from '@/lib/practice';
import { currentStreak, readStepsForToday, toggleAllStepsToday } from '@/lib/progress';
import { orderProtocolsForNow } from '@/lib/protocol-order';

type ProgressMap = Record<string, number[]>;

function TodayBar({ done, total }: { done: number; total: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(total === 0 ? 0 : (done / total) * 100, { duration: 400 });
  }, [done, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.trackFill, fillStyle]} />
    </View>
  );
}

function StepDots({ done, total }: { done: number; total: number }) {
  return (
    <View style={styles.stepDots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.stepDot, i < done && styles.stepDotDone]} />
      ))}
    </View>
  );
}

function RowCheckbox({ checked }: { checked: boolean }) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 180 });
    if (checked) {
      scale.value = withSequence(withTiming(1.15, { duration: 90 }), withSpring(1));
    }
  }, [checked, progress, scale]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Renew.cream, Renew.accent]),
    borderColor: interpolateColor(progress.value, [0, 1], [Renew.muted, Renew.dark]),
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.rowCheckbox, style]}>
      {checked ? <Text style={styles.rowCheckmark}>✓</Text> : null}
    </Animated.View>
  );
}

function PracticeCard({
  protocol,
  isDone,
  width,
}: {
  protocol: Protocol;
  isDone: boolean;
  width: number;
}) {
  const duration = formatDuration(protocol.howTo.totalTime);

  const meta = [
    `${protocol.howTo.steps.length} steps`,
    protocol.sources?.length ? `${protocol.sources.length} sources` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={{ pathname: '/articles/[slug]', params: { slug: protocol.slug } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { width, height: Math.round(width * 1.2) },
          pressed && styles.cardPressed,
        ]}>
        <Image
          source={protocol.imagexl ?? protocol.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.cardScrim} />
        <View style={styles.cardContent}>
          <View style={[styles.chip, isDone && styles.chipDone]}>
            <Text style={[styles.chipText, isDone && styles.chipTextDone]}>
              {isDone ? '✓ Done today' : (duration ?? 'Practice')}
            </Text>
          </View>
          <Text style={styles.cardName} numberOfLines={2}>
            {practiceName(protocol)}
          </Text>
          <Text style={styles.cardMeta}>{meta}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function AllDoneCard({ total }: { total: number }) {
  return (
    <View style={styles.allDone}>
      <Text style={styles.allDoneTitle}>All done for today</Text>
      <Text style={styles.allDoneBody}>
        You have completed all {total} practices. Come back tomorrow — consistency is the
        protocol.
      </Text>
    </View>
  );
}

function ProtocolRow({
  protocol,
  done,
  onToggle,
}: {
  protocol: Protocol;
  done: number[];
  onToggle: () => void;
}) {
  const total = protocol.howTo.steps.length;
  const isDone = done.length === total;
  const duration = formatDuration(protocol.howTo.totalTime);

  return (
    <View style={styles.row}>
      <Pressable onPress={onToggle} hitSlop={10}>
        <RowCheckbox checked={isDone} />
      </Pressable>

      <Link href={{ pathname: '/articles/[slug]', params: { slug: protocol.slug } }} asChild>
        <Pressable style={({ pressed }) => [styles.rowBody, pressed && styles.rowPressed]}>
          <Text style={[styles.rowName, isDone && styles.rowNameDone]} numberOfLines={2}>
            {practiceName(protocol)}
          </Text>
          <View style={styles.rowMeta}>
            <Text style={styles.rowDuration}>{duration ?? '—'}</Text>
            <StepDots done={done.length} total={total} />
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

export default function HomeScreen() {
  const { data: articles, error, isLoading, isOffline, isRefreshing, refresh } = useArticles();
  const [progress, setProgress] = useState<ProgressMap>({});
  const seeded = useRef(false);

  const protocols = useMemo(() => (articles ? onlyProtocols(articles) : []), [articles]);
  const ordered = useMemo(() => orderProtocolsForNow(protocols), [protocols]);

  // Ancho real de la columna de contenido, medido — no derivado de la ventana,
  // que en algunos dispositivos incluye insets y desalinea el carrusel.
  const [cardWidth, setCardWidth] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (seeded.current || protocols.length === 0) return;
    seeded.current = true;

    const seed: ProgressMap = {};
    protocols.forEach((protocol) => {
      seed[protocol.slug] = readStepsForToday(protocol.slug);
    });
    setProgress(seed);
  }, [protocols]);

  function isComplete(protocol: Protocol): boolean {
    return (progress[protocol.slug]?.length ?? 0) === protocol.howTo.steps.length;
  }

  function handleToggle(protocol: Protocol) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = toggleAllStepsToday(protocol.slug, protocol.howTo.steps.length);
    setProgress((prev) => ({ ...prev, [protocol.slug]: next }));
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Renew.sage} />
      </View>
    );
  }

  if (error || !articles) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn’t load your practices</Text>
        <Text style={styles.errorBody}>{error ?? 'Empty response'}</Text>
        <Pressable onPress={refresh} style={styles.retry} disabled={isRefreshing}>
          <Text style={styles.retryText}>{isRefreshing ? 'Retrying…' : 'Try again'}</Text>
        </Pressable>
      </View>
    );
  }

  const doneToday = ordered.filter(isComplete).length;
  const allDone = ordered.length > 0 && doneToday === ordered.length;
  const streak = currentStreak();
  const rows = [...ordered.filter((p) => !isComplete(p)), ...ordered.filter(isComplete)];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={rows}
          keyExtractor={(protocol) => protocol.slug}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[Renew.sage]}
              tintColor={Renew.sage}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View
              style={styles.header}
              onLayout={(event) => setCardWidth(Math.round(event.nativeEvent.layout.width * 0.66))}>
              <RenewLogo />
              <Text style={styles.date}>{formatEditorialDate().toUpperCase()}</Text>
              <Text style={styles.standfirst}>
                Daily practices for health and longevity — with the evidence behind them.
              </Text>
              {isOffline ? (
                <Text style={styles.offline}>Offline · showing saved content</Text>
              ) : null}

              {cardWidth > 0 ? (
                <FlatList
                  horizontal
                  data={ordered}
                  keyExtractor={(protocol) => protocol.slug}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardWidth + Spacing.three}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  style={styles.carousel}
                  contentContainerStyle={styles.carouselContent}
                  onMomentumScrollEnd={(event) => {
                    const offset = event.nativeEvent.contentOffset.x;
                    setPage(Math.round(offset / (cardWidth + Spacing.three)));
                  }}
                  renderItem={({ item }) => (
                    <PracticeCard protocol={item} isDone={isComplete(item)} width={cardWidth} />
                  )}
                />
              ) : null}

              <View style={styles.pageDots}>
                {ordered.map((protocol, index) => (
                  <View
                    key={protocol.slug}
                    style={[styles.pageDot, index === page && styles.pageDotActive]}
                  />
                ))}
              </View>

              {allDone ? <AllDoneCard total={ordered.length} /> : null}

              <View style={styles.today}>
                <View style={styles.todayRow}>
                  <Text style={styles.todayLabel}>
                    Your day · {doneToday} of {ordered.length}
                  </Text>
                  {streak >= 2 ? (
                    <Text style={styles.streak}>{streak}-day streak</Text>
                  ) : null}
                </View>
                <TodayBar done={doneToday} total={ordered.length} />
                {doneToday === 0 ? (
                  <Text style={styles.hint}>Tap a practice’s circle when you complete it.</Text>
                ) : null}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ProtocolRow
              protocol={item}
              done={progress[item.slug] ?? []}
              onToggle={() => handleToggle(item)}
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Renew.cream,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    backgroundColor: Renew.cream,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: RenewFonts.bold,
    color: Renew.dark,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    fontFamily: RenewFonts.regular,
    color: Renew.muted,
  },
  retry: {
    marginTop: Spacing.three,
    borderWidth: 1,
    borderColor: Renew.sage,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  retryText: {
    fontSize: 14,
    fontFamily: RenewFonts.semibold,
    color: Renew.sage,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  date: {
    fontSize: 11,
    fontFamily: RenewFonts.semibold,
    letterSpacing: 2.2,
    color: Renew.muted,
  },
  standfirst: {
    fontFamily: RenewFonts.serif,
    fontSize: 16,
    lineHeight: 24,
    color: Renew.dark,
    marginTop: -Spacing.one,
  },
  offline: {
    fontSize: 12,
    fontFamily: RenewFonts.semibold,
    letterSpacing: 0.6,
    color: Renew.clay,
  },
  carousel: {
    marginTop: Spacing.two,
  },
  carouselContent: {
    gap: Spacing.three,
  },
  card: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: Renew.ink,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardScrim: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      'linear-gradient(to top, rgba(15,23,20,0.95) 0%, rgba(15,23,20,0.55) 55%, rgba(15,23,20,0.15) 100%)',
  },
  cardContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: Renew.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipDone: {
    backgroundColor: Renew.sage,
  },
  chipText: {
    fontSize: 11,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Renew.dark,
  },
  chipTextDone: {
    color: '#ffffff',
  },
  cardName: {
    fontFamily: RenewFonts.serif,
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: RenewFonts.semibold,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  pageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: -Spacing.one,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Renew.border,
  },
  pageDotActive: {
    width: 18,
    backgroundColor: Renew.sage,
  },
  allDone: {
    backgroundColor: Renew.mist,
    borderLeftWidth: 4,
    borderLeftColor: Renew.accent,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  allDoneTitle: {
    fontFamily: RenewFonts.serif,
    fontSize: 24,
    color: Renew.dark,
  },
  allDoneBody: {
    fontFamily: RenewFonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: Renew.muted,
  },
  today: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  todayLabel: {
    fontSize: 12,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
  streak: {
    fontSize: 12,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Renew.clay,
  },
  hint: {
    fontSize: 12,
    fontFamily: RenewFonts.regular,
    color: Renew.muted,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Renew.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Renew.sage,
  },
  separator: {
    height: 1,
    backgroundColor: Renew.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCheckmark: {
    fontSize: 15,
    lineHeight: 19,
    color: Renew.dark,
    fontFamily: RenewFonts.bold,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowName: {
    fontFamily: RenewFonts.serif,
    fontSize: 18,
    lineHeight: 24,
    color: Renew.dark,
  },
  rowNameDone: {
    color: Renew.muted,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowDuration: {
    fontSize: 12,
    fontFamily: RenewFonts.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 3,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Renew.border,
  },
  stepDotDone: {
    backgroundColor: Renew.sage,
    borderColor: Renew.sage,
  },
});
