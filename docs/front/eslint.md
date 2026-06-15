# ESLint — manual de configuración

Versión activa: **ESLint v10** con flat config (formato nuevo desde v9).

---

## Formato flat config

El archivo `eslint.config.js` usa el nuevo formato de ESLint (flat config). No hay `.eslintrc` ni `.eslintignore` — todo está en un solo archivo JS.

```js
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  { ... }
])
```

`defineConfig` es un helper de tipado, no cambia la lógica.
`globalIgnores` reemplaza al `.eslintignore` de antes.

---

## Configuración actual

```js
globalIgnores(['dist'])
```

Excluye la carpeta `dist` del análisis. Sin esto, ESLint revisaría el código compilado.

---

```js
files: ['**/*.{ts,tsx}']
```

Solo analiza archivos TypeScript. Los archivos `.js` (como el propio `eslint.config.js`) no están cubiertos.

---

### Plugins activos

#### `js.configs.recommended`

Reglas core de ESLint. Incluye ~40 reglas básicas de JavaScript:
- `no-unused-vars` — detecta variables declaradas y no usadas
- `no-undef` — detecta variables no declaradas
- `no-redeclare` — prohíbe re-declarar variables
- `eqeqeq` — exige `===` en lugar de `==`

#### `tseslint.configs.recommended`

Reglas específicas de TypeScript del paquete `typescript-eslint`. Incluye:
- `@typescript-eslint/no-explicit-any` — avisa cuando usás `any`
- `@typescript-eslint/no-unused-vars` — versión TS de no-unused-vars
- `@typescript-eslint/no-require-imports` — prohíbe `require()` en favor de `import`

> Esta configuración NO usa información de tipos. Las reglas que requieren el compilador TypeScript (como detectar código inalcanzable por tipos) no están activas. Ver sección "Modo type-aware" más abajo.

#### `reactHooks.configs.flat.recommended`

Dos reglas para hooks de React:
- `react-hooks/rules-of-hooks` — error si un hook se llama condicionalmente o fuera de un componente
- `react-hooks/exhaustive-deps` — warning si el array de dependencias de `useEffect`/`useCallback` está incompleto

#### `reactRefresh.configs.vite`

Una regla:
- `react-refresh/only-export-components` — warning si un archivo exporta algo que no es un componente React (rompería el Hot Module Replacement)

---

### globals.browser

```js
languageOptions: {
  globals: globals.browser,
}
```

Declara las variables globales del navegador como conocidas para ESLint: `window`, `document`, `fetch`, `localStorage`, `console`, `setTimeout`, etc. Sin esto, ESLint marcaría esas referencias como `no-undef`.

---

## Cómo ejecutar el linter

```bash
pnpm lint         # analiza todo el proyecto
```

El script en `package.json` ejecuta `eslint .` — revisa todos los archivos del proyecto.

---

## Modo type-aware (opcional)

La config actual usa `tseslint.configs.recommended`, que no necesita el compilador TypeScript. Si querés reglas más potentes que sí usan los tipos:

```js
// eslint.config.js
{
  files: ['**/*.{ts,tsx}'],
  extends: [
    tseslint.configs.recommendedTypeChecked,  // reemplaza recommended
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
}
```

Esto habilita reglas como:
- `@typescript-eslint/no-floating-promises` — detecta promesas sin `await` ni `.catch()`
- `@typescript-eslint/no-unsafe-assignment` — detecta asignaciones desde `any`

> Atención: el type-aware mode ralentiza el linting porque invoca al compilador TS. Para proyectos chicos no hay diferencia notable, pero en proyectos grandes puede ser lento.
