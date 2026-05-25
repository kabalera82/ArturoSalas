# EditorConfig — manual de configuración

EditorConfig es un archivo de configuración que le dice al editor cómo formatear el código: indentación, saltos de línea, espacios al final, etc. No depende de ningún linter — actúa a nivel de editor, antes de que ESLint o Prettier entren en juego.

La mayoría de los editores modernos (VS Code, WebStorm, Neovim) lo leen automáticamente. VS Code necesita la extensión [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

---

## Configuración actual

```ini
root = true

[*]
indent_style = space

[*.{cs,js,jsx,less,css,yml,ts,tsx}]
indent_size = 2

[*.{*.json}]
indent_size = 2
```

### `root = true`

Le dice a EditorConfig que este archivo es la raíz del proyecto. Cuando el editor busca el `.editorconfig`, sube por el árbol de carpetas hasta encontrar uno con `root = true` y para ahí. Importante en monorepos donde hay configuraciones anidadas.

### `[*]` — todos los archivos

```ini
indent_style = space
```

Aplica a cualquier archivo: usá espacios, no tabs.

### `[*.{cs,js,jsx,less,css,yml,ts,tsx}]`

```ini
indent_size = 2
```

Para estos tipos de archivo, cada nivel de indentación son 2 espacios. La `cs` (C#) está de más en un proyecto web puro — no rompe nada, pero es ruido.

---

## Bug en la configuración actual

```ini
[*.{*.json}]   ← INCORRECTO
indent_size = 2
```

El patrón `*.{*.json}` tiene un glob anidado dentro de llaves que EditorConfig no procesa como se espera. En la práctica, este patrón NO matchea archivos como `package.json` o `tsconfig.json`.

La forma correcta es:

```ini
[*.json]
indent_size = 2
```

---

## Configuración recomendada

Una versión completa y correcta para este proyecto:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### Qué agrega cada regla nueva

| Regla | Valor | Por qué |
|---|---|---|
| `end_of_line` | `lf` | Normaliza saltos de línea a Unix (LF). Evita conflictos en git entre Windows y Mac/Linux |
| `charset` | `utf-8` | Garantiza que todos los archivos usen UTF-8 |
| `trim_trailing_whitespace` | `true` | Elimina espacios al final de cada línea al guardar |
| `insert_final_newline` | `true` | Agrega una línea vacía al final del archivo. POSIX lo requiere; muchas herramientas lo esperan |

### Por qué `[*.md]` tiene `trim_trailing_whitespace = false`

En Markdown, dos espacios al final de una línea crean un `<br>`. Si EditorConfig los elimina, podés perder saltos de línea intencionales dentro de párrafos.

---

## Relación con ESLint y Prettier

| Herramienta | Cuándo actúa | Qué controla |
|---|---|---|
| EditorConfig | Al escribir/guardar en el editor | Indentación, charset, saltos de línea |
| ESLint | Al ejecutar `pnpm lint` | Calidad del código, errores lógicos, patrones |
| Prettier | Al formatear | Estilo completo del código (si se usa) |

Este proyecto no usa Prettier. EditorConfig cubre lo básico de formato y ESLint cubre la calidad del código.
