import { Image } from 'expo-image';
import { Link } from 'expo-router';
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

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Renew, RenewFonts } from '@/constants/renew-theme';
import { useArticles } from '@/hooks/use-articles';
import { formatDate, type FullArticle } from '@/lib/articles';

function ArticleCard({ article }: { article: FullArticle }) {
  return (
    <Link href={{ pathname: '/articles/[slug]', params: { slug: article.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <Image
          source={article.image}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardBody}>
          <Text style={styles.badge}>{article.category}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.excerpt} numberOfLines={2}>
            {article.excerpt}
          </Text>
          <Text style={styles.dateText}>{formatDate(article.publishedAt)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function LibraryScreen() {
  const { data: articles, error, isLoading, isOffline, isRefreshing, refresh } = useArticles();

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
        <Text style={styles.errorTitle}>Couldn’t load the library</Text>
        <Text style={styles.errorBody}>{error ?? 'Empty response'}</Text>
        <Pressable onPress={refresh} style={styles.retry} disabled={isRefreshing}>
          <Text style={styles.retryText}>{isRefreshing ? 'Retrying…' : 'Try again'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={articles}
          keyExtractor={(article) => article.slug}
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
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Library</Text>
              <Text style={styles.subtitle}>
                {articles.length} articles · evidence-based health and longevity
              </Text>
              {isOffline ? (
                <Text style={styles.offline}>Offline · showing saved content</Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <ArticleCard article={item} />}
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
    gap: Spacing.four,
  },
  header: {
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  title: {
    fontFamily: RenewFonts.serif,
    fontSize: 32,
    color: Renew.dark,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: RenewFonts.regular,
    color: Renew.muted,
  },
  offline: {
    marginTop: Spacing.two,
    fontSize: 12,
    fontFamily: RenewFonts.semibold,
    letterSpacing: 0.6,
    color: Renew.clay,
  },
  card: {
    backgroundColor: Renew.paper,
    borderWidth: 1,
    borderColor: Renew.border,
    overflow: 'hidden',
    shadowColor: Renew.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  cardBody: {
    padding: Spacing.four,
  },
  badge: {
    fontSize: 11,
    fontFamily: RenewFonts.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Renew.sage,
  },
  cardTitle: {
    marginTop: Spacing.two,
    fontSize: 18,
    fontFamily: RenewFonts.semibold,
    lineHeight: 25,
    color: Renew.dark,
  },
  excerpt: {
    marginTop: Spacing.two,
    fontSize: 14,
    fontFamily: RenewFonts.regular,
    lineHeight: 21,
    color: Renew.muted,
  },
  dateText: {
    marginTop: Spacing.three,
    fontSize: 12,
    fontFamily: RenewFonts.regular,
    color: Renew.muted,
  },
});
