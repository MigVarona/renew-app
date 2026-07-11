import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ArticleSources } from '@/components/article-sources';
import { ProtocolCard } from '@/components/protocol-card';
import { Renew, RenewFonts } from '@/constants/renew-theme';
import { Spacing } from '@/constants/theme';
import { useArticle } from '@/hooks/use-articles';
import { formatDate, splitParagraphs } from '@/lib/articles';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {splitParagraphs(text).map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </>
  );
}

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article, error, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Renew.sage} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn’t load this article</Text>
        <Text style={styles.errorBody}>{error ?? 'Empty response'}</Text>
      </View>
    );
  }

  const hero = article.imagexl ?? article.image;
  const articleUrl = `https://www.renew-habits.com/articles/${article.slug}`;

  function share() {
    Share.share({ message: `${article!.title}\n${articleUrl}` });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={share} hitSlop={10}>
              <Text style={styles.shareButton}>Share</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.hero}>
        <Image source={hero} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.heroScrim} />
        <View style={styles.heroText}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badge}>{article.category}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.lead}>{article.excerpt}</Text>
          <Text style={styles.meta}>
            {formatDate(article.publishedAt)} · by {article.author ?? 'RENEW Editorial'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {article.text ? <Paragraphs text={article.text} /> : null}

        {article.image2xl ? (
          <Image
            source={article.image2xl}
            style={styles.inlineImage}
            contentFit="cover"
            transition={200}
          />
        ) : null}

        {article.text2 ? <Paragraphs text={article.text2} /> : null}
      </View>

      {article.howTo ? (
        <View style={styles.protocol}>
          <ProtocolCard slug={article.slug} howTo={article.howTo} />
        </View>
      ) : null}

      {article.sources?.length ? (
        <View style={styles.sources}>
          <ArticleSources sources={article.sources} />
        </View>
      ) : null}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          The content on RENEW is for informational purposes only and does not constitute medical
          advice. Always consult a qualified healthcare professional before making health-related
          decisions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Renew.cream,
  },
  content: {
    paddingBottom: Spacing.six,
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
  hero: {
    minHeight: 540,
    justifyContent: 'flex-end',
    backgroundColor: Renew.ink,
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      'linear-gradient(to top, rgba(15,23,20,0.97) 0%, rgba(15,23,20,0.88) 30%, rgba(15,23,20,0.6) 65%, rgba(15,23,20,0.25) 100%)',
  },
  heroText: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: Renew.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge: {
    fontSize: 12,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Renew.dark,
  },
  title: {
    fontFamily: RenewFonts.serif,
    fontSize: 34,
    lineHeight: 38,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
  },
  lead: {
    fontFamily: RenewFonts.regular,
    fontSize: 17,
    lineHeight: 27,
    color: 'rgba(255,255,255,0.88)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 10,
  },
  meta: {
    fontFamily: RenewFonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five,
  },
  protocol: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
  },
  sources: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  paragraph: {
    fontFamily: RenewFonts.serif,
    fontSize: 18,
    lineHeight: 33,
    color: 'rgba(24,33,29,0.85)',
    marginBottom: Spacing.four,
  },
  inlineImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderWidth: 1,
    borderColor: Renew.border,
    marginVertical: Spacing.five,
  },
  shareButton: {
    fontSize: 14,
    fontFamily: RenewFonts.semibold,
    color: Renew.sage,
  },
  disclaimer: {
    marginTop: Spacing.five,
    marginHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Renew.border,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: RenewFonts.regular,
    color: Renew.muted,
  },
});
