# Guidance for Codex Agents

This repository uses a single working branch named `work`. Follow these guidelines for contributions:

## Commits
- Write concise commit messages in the imperative mood (e.g. "Add tests" or "Fix schema path").
- Do not amend or rebase existing commits.
- Keep the working tree clean before finishing tasks (`git status` should show no changes).

## Pull Requests
- Summarize key changes in the PR body under a `Summary` heading.
- Document how you tested under a `Testing` heading.
- Run `npm test` and `python -m pytest -q`; if a command fails due to missing dependencies, note it in the Testing section.

## Code Style
- Use Markdown for documentation.
- Keep JSON files formatted with two-space indentation.
- Place example data in the `examples/` directory.

## Notes for Agents
- Cite lines from files or terminal output when referencing changes.
- Avoid referencing commit hashes directly in the final PR text.
