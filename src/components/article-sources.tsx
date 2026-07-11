import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Renew, RenewFonts } from '@/constants/renew-theme';
import { Spacing } from '@/constants/theme';
import { hasStrongEvidence, type Source } from '@/lib/articles';

function SourceRow({ source }: { source: Source }) {
  return (
    <Pressable
      onPress={() => WebBrowser.openBrowserAsync(source.url)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Text style={styles.rowTitle}>{source.title}</Text>
      <Text style={styles.rowMeta}>
        {source.publisher} · {source.year} · <Text style={styles.studyType}>{source.studyType}</Text>
      </Text>
    </Pressable>
  );
}

export function ArticleSources({ sources }: { sources: Source[] }) {
  const strong = hasStrongEvidence(sources);
  const count = sources.length === 1 ? '1 source' : `${sources.length} sources`;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>
          {strong ? `Peer-reviewed · ${count}` : count}
        </Text>
      </View>

      <Text style={styles.heading}>The evidence</Text>

      <View style={styles.rows}>
        {sources.map((source) => (
          <SourceRow key={source.url} source={source} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Renew.border,
    backgroundColor: Renew.mist,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Renew.accent,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: RenewFonts.semibold,
    color: Renew.sage,
  },
  heading: {
    fontFamily: RenewFonts.serif,
    fontSize: 24,
    color: Renew.dark,
  },
  rows: {
    borderTopWidth: 1,
    borderTopColor: Renew.border,
  },
  row: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Renew.border,
    gap: 4,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowTitle: {
    fontFamily: RenewFonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: Renew.dark,
  },
  rowMeta: {
    fontFamily: RenewFonts.regular,
    fontSize: 12,
    color: Renew.muted,
  },
  studyType: {
    fontFamily: RenewFonts.bold,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
});
