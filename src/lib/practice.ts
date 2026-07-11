import type { Protocol } from '@/lib/articles';

// Nombres curados a mano cuando la derivación automática no da el nombre deseado.
const NAME_OVERRIDES: Record<string, string> = {
  'minimalist-morning-routine-habits': 'Minimalist Morning',
};

// Los nombres de howTo vienen del schema SEO ("How to start exercise snacks"):
// para la UI usamos el nombre editorial del artículo, que en Renew va antes de los dos puntos.
export function practiceName(protocol: Protocol): string {
  const override = NAME_OVERRIDES[protocol.slug];
  if (override) return override;

  const [head] = protocol.title.split(':');

  let name =
    head && head.trim().length > 0 && head.length < protocol.title.length
      ? head.trim()
      : protocol.title;

  // Los titulares sin dos puntos suelen llevar coletilla ("...That Actually Stick"):
  // para nombrar la práctica basta el sujeto.
  const beforeThat = name.split(/\s+that\s+/i)[0].trim();
  if (beforeThat.length >= 12 && beforeThat.length < name.length) {
    name = beforeThat;
  }

  return name;
}
