const ARTICLES_URL = 'https://www.renew-habits.com/api/articles';

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  publishedAt: string;
};

export type StudyType =
  | 'meta-analysis'
  | 'rct'
  | 'cohort'
  | 'observational'
  | 'review'
  | 'institutional';

export type Source = {
  title: string;
  url: string;
  publisher: string;
  year: number;
  studyType: StudyType;
};

export type HowToStep = {
  name: string;
  text: string;
};

export type HowTo = {
  name: string;
  description: string;
  totalTime: string;
  steps: HowToStep[];
};

export type FullArticle = Article & {
  author?: string;
  imagexl?: string;
  image2xl?: string;
  text?: string;
  text2?: string;
  sources?: Source[];
  howTo?: HowTo;
};

const STRONG_STUDY_TYPES: StudyType[] = ['meta-analysis', 'rct'];

export function hasStrongEvidence(sources: Source[]): boolean {
  return sources.some((source) => STRONG_STUDY_TYPES.includes(source.studyType));
}

export function formatDuration(iso: string): string | null {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(iso);

  if (!match) return null;

  const days = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);

  if (days > 0) return days === 1 ? '1 day' : `${days} days`;
  if (minutes === 0) return null;
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(Boolean);
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export async function fetchArticles(): Promise<FullArticle[]> {
  const response = await fetch(ARTICLES_URL);

  if (!response.ok) {
    throw new Error(`The API responded with ${response.status}`);
  }

  return response.json();
}

export type Protocol = FullArticle & { howTo: HowTo };

// Prácticas que la app no propone como hábito diario aunque el artículo tenga howTo
// (el howTo se mantiene en la web por el schema SEO): el ayuno tiene contraindicaciones
// médicas reales y Zone 2 exige una hora — ambos siguen accesibles desde la Biblioteca.
const EXCLUDED_PRACTICES = new Set([
  'intermittent-fasting-metabolic-health',
  'zone-2-cardio-healthspan',
]);

export function onlyProtocols(articles: FullArticle[]): Protocol[] {
  return articles.filter(
    (article): article is Protocol =>
      Boolean(article.howTo) && !EXCLUDED_PRACTICES.has(article.slug)
  );
}

export async function fetchArticle(slug: string): Promise<FullArticle> {
  const response = await fetch(`${ARTICLES_URL}/${slug}`);

  if (!response.ok) {
    throw new Error(`The API responded with ${response.status}`);
  }

  return response.json();
}
