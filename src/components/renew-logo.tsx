import { StyleSheet, Text, View } from 'react-native';

import { Renew, RenewFonts } from '@/constants/renew-theme';

export function RenewLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.bar} />
      <View style={styles.words}>
        <Text style={styles.wordmark}>RENEW</Text>
        <Text style={styles.tagline}>Health &amp; Longevity</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  bar: {
    width: 4,
    minHeight: 36,
    marginTop: 3,
    borderRadius: 2,
    backgroundColor: Renew.accent,
  },
  words: {
    justifyContent: 'center',
    paddingVertical: 2,
  },
  wordmark: {
    fontFamily: RenewFonts.serif,
    fontSize: 25,
    lineHeight: 25,
    letterSpacing: 7.9,
    color: Renew.dark,
  },
  tagline: {
    marginTop: 8,
    fontFamily: RenewFonts.semibold,
    fontSize: 9.3,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
});
