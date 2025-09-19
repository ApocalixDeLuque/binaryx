# Contributing to binaryx

Thanks for wanting to help! We welcome bug reports, feature requests, documentation improvements, and code contributions.

## Ground rules

- Be kind and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
- By contributing, you agree your contributions are licensed under the project’s [AGPL-3.0](./LICENSE).

## How to get help or propose ideas

- **Bugs**: Open an Issue using the “Bug report” template with steps to reproduce.
- **Features**: Open an Issue using the “Feature request” template and explain the use case.
- **Questions/Design**: Use GitHub Discussions if enabled, otherwise open an Issue.

## Development setup

- Prerequisites: Node.js ≥ 18 (or Bun ≥ 1.1), Git.
- Clone: `git clone https://github.com/ApocalixDeLuque/binaryx && cd binaryx`
- Install: `npm ci` (or `bun install`)
- Build: `npm run build` (or `bun run build`)
- Test: `npm test` (or `bun test`)
- Lint/format: `npm run lint && npm run format`

Document any extra steps (env vars, local config) in the README.

## Branching & commits

- Branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Commits: use **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Keep PRs small and focused; link related Issues (e.g., “Closes #123”).

## Pull request process

1. Run lint, tests, and build locally before opening the PR.
2. Update docs and CHANGELOG if behavior changes.
3. Fill out the PR template (summary, testing steps, screenshots if UI).
4. At least one maintainer review approval is required before merge.
5. Maintainers squash-merge unless otherwise discussed.

## Coding guidelines

- Prefer readability; include comments when logic is non-obvious.
- Add or update tests for any behavior change.
- Avoid introducing new dependencies unless justified.

## Issue triage (for maintainers)

- Label Issues (`bug`, `enhancement`, `question`, `good first issue`, `help wanted`).
- Ask for reproduction when missing details.
- Close issues that are inactive after reasonable attempts to clarify.

## Security

Please **do not** open public issues for vulnerabilities. Follow [SECURITY.md](./SECURITY.md).

## Release & versioning

- We use Semantic Versioning (MAJOR.MINOR.PATCH).
- Tag releases in Git and publish release notes on GitHub.

## License

By contributing to this repository, you agree your contributions are licensed under the [GNU AGPL-3.0](./LICENSE).
