# Renew

App móvil de hábitos de bienestar construida con [Expo](https://expo.dev) y React Native. Renew convierte artículos respaldados por evidencia científica en *prácticas* diarias con pasos accionables, seguimiento de progreso, rachas y recordatorios.

Funciona en iOS, Android y web, y consume el contenido editorial desde la API de [renew-habits.com](https://www.renew-habits.com).

## Características

- **Prácticas diarias**: cada artículo con protocolo se transforma en una práctica con pasos que puedes marcar día a día.
- **Progreso y rachas**: seguimiento local del avance diario y de la racha actual, persistido con `expo-sqlite/kv-store`.
- **Orden inteligente**: las prácticas se reordenan según el momento del día (mañana, tarde, noche).
- **Recordatorios**: notificaciones locales configurables por práctica con `expo-notifications`.
- **Explorar**: catálogo de artículos con fuentes científicas clasificadas por tipo de estudio (meta-análisis, RCT, cohorte...).
- **Tema claro/oscuro** automático y tipografía editorial (PT Serif + Noto Sans).

## Stack

- Expo SDK 57 · React Native 0.86 · React 19
- [Expo Router](https://docs.expo.dev/router/introduction/) (rutas tipadas, file-based routing)
- React Compiler habilitado
- Reanimated 4 + expo-haptics para animaciones y feedback
- TypeScript

## Estructura

```
src/
├── app/            # Rutas (Expo Router)
│   ├── (tabs)/     # Pestañas: Hoy y Explorar
│   └── articles/   # Detalle de artículo por slug
├── components/     # UI compartida (variantes .web.tsx para web)
├── hooks/          # use-articles, use-protocol-progress, use-reminder...
├── lib/            # Lógica: progreso, rachas, recordatorios, orden, fechas
└── constants/      # Tema y tokens de diseño de Renew
```

## Empezar

Requisitos: Node 18+ y npm.

```bash
npm install
npx expo start
```

Desde el menú de Expo puedes abrir la app en:

- Simulador de iOS (`npm run ios`)
- Emulador de Android (`npm run android`)
- Web (`npm run web`)
- [Expo Go](https://expo.dev/go) o un [development build](https://docs.expo.dev/develop/development-builds/introduction/)

> Los recordatorios requieren un dispositivo físico o development build; las notificaciones no funcionan en Expo Go desde SDK 53.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm run ios` / `android` | Compila y ejecuta en nativo |
| `npm run web` | Ejecuta en el navegador |
| `npm run lint` | Linter de Expo |
| `node scripts/generate-brand-assets.mjs` | Regenera iconos y splash |

## Licencia

MIT
