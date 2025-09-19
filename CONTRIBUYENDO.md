# Cómo contribuir a binaryx

¡Gracias por querer ayudar! Aceptamos reportes de errores, solicitudes de funciones, mejoras de documentación y contribuciones de código.

## Reglas básicas

- Sé amable y sigue nuestro [Código de Conducta](./CODIGO_DE_CONDUCTA.md).
- Al contribuir, aceptas que tus aportaciones se licencien bajo la [AGPL-3.0](./LICENSE) del proyecto.

## Cómo pedir ayuda o proponer ideas

- **Errores (bugs)**: Abre un Issue con la plantilla de “Bug report” incluyendo pasos para reproducir.
- **Funciones**: Abre un Issue con la plantilla de “Feature request” y explica el caso de uso.
- **Preguntas/Diseño**: Usa GitHub Discussions si está habilitado; de lo contrario, abre un Issue.

## Entorno de desarrollo

- Requisitos: Node.js ≥ 18 (o Bun ≥ 1.1), Git.
- Clonar: `git clone https://github.com/ApocalixDeLuque/binaryx && cd binaryx`
- Instalar: `npm ci` (o `bun install`)
- Compilar: `npm run build` (o `bun run build`)
- Probar: `npm test` (o `bun test`)
- Lint/formato: `npm run lint && npm run format`

Documenta pasos extra (variables de entorno, configuración local) en el README.

## Ramas y commits

- Ramas: `feat/<nombre-corto>`, `fix/<nombre-corto>`, `docs/<nombre-corto>`.
- Commits: usa **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Mantén los PR pequeños y enfocados; enlaza Issues relacionados (“Closes #123”).

## Proceso de Pull Request

1. Asegura que CI pase (tests, lint).
2. Actualiza docs y CHANGELOG si cambia el comportamiento.
3. Completa la plantilla de PR (resumen, pasos de prueba, capturas si hay UI).
4. Se requiere aprobación de al menos una persona mantenedora antes del merge.
5. Mantenedoras/es usarán squash-merge salvo que se acuerde otra cosa.

## Guías de código

- Prioriza legibilidad; comenta cuando la lógica no sea obvia.
- Agrega o actualiza pruebas ante cualquier cambio de comportamiento.
- Evita introducir dependencias nuevas salvo justificación.

## Triage de Issues (para mantenedores)

- Etiqueta Issues (`bug`, `enhancement`, `question`, `good first issue`, `help wanted`).
- Solicita reproducción cuando falten detalles.
- Cierra issues inactivos tras intentos razonables de aclaración.

## Seguridad

Por favor **no** abras issues públicos para vulnerabilidades. Sigue [SEGURIDAD.md](./SEGURIDAD.md).

## Lanzamientos y versionado

- Usamos Versionado Semántico (MAJOR.MINOR.PATCH).
- Etiqueta lanzamientos en Git y publica notas en GitHub.

## Licencia

Al contribuir a este repositorio, aceptas que tus aportaciones se licencien bajo la [GNU AGPL-3.0](./LICENSE).
