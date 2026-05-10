#!/usr/bin/env bash
# Agentic Contract — remote installer.
# Usage:
#   curl -sL https://raw.githubusercontent.com/danlex/agentic-contract/main/install-remote.sh | bash
#
# Run from the root of the project you want to wrap. The script:
#   - Creates .claude/contracts/, .claude/agents/, and hooks/ if they don't exist.
#   - Downloads the subagent definitions and hook scripts (overwriting existing
#     copies — they are code-like, treat as library updates).
#   - For policy files (CLAUDE.md, .claude/settings.json, and the four contracts),
#     writes a *.contract-suggested sibling instead of overwriting, so user
#     customizations and accumulated user-rules.md entries are never silently
#     replaced. Merge by hand.
#   - Makes the hook scripts executable.

set -euo pipefail

REPO="danlex/agentic-contract"
BRANCH="main"
BASE="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

say()  { printf '%s\n' "$*"; }
note() { printf '  %s\n' "$*"; }

# Refuse to run as root unless the user really insists.
if [ "$(id -u)" = "0" ] && [ -z "${ALLOW_ROOT:-}" ]; then
  say "Refusing to install as root. Re-run as a normal user, or set ALLOW_ROOT=1 to override."
  exit 1
fi

# Need curl.
if ! command -v curl >/dev/null 2>&1; then
  say "curl not found. Install curl and re-run."
  exit 1
fi

say "→ Installing Agentic Contract from ${REPO}@${BRANCH}"
say "  target directory: $(pwd)"

mkdir -p .claude/contracts .claude/agents hooks

# Code-like files (subagent definitions, hook scripts). Upgraded in place.
# If you customize regexes or check lists, re-apply them after each update.
OVERWRITE_FILES=(
  ".claude/agents/contract-judge.md"
  ".claude/agents/contract-keeper.md"
  "hooks/pre-tool-use-contract-check.js"
  "hooks/stop-contract-judge.js"
  "hooks/stop-contract-keeper.js"
)

for f in "${OVERWRITE_FILES[@]}"; do
  note "↓ ${f}"
  curl -fsSL "${BASE}/${f}" -o "${f}"
done

# Policy files. Never silently overwritten — existing files are preserved and
# the upstream copy is written as a *.contract-suggested sibling for manual
# merge. This is critical for user-rules.md (your accumulated USR-NNN rules)
# and for any contract you've customized.
MERGE_FILES=(
  "CLAUDE.md"
  ".claude/settings.json"
  ".claude/contracts/master.md"
  ".claude/contracts/coding.md"
  ".claude/contracts/ethics.md"
  ".claude/contracts/user-rules.md"
)

WROTE_SUGGESTED=0
for f in "${MERGE_FILES[@]}"; do
  if [ -e "${f}" ]; then
    suggested="${f}.contract-suggested"
    note "! ${f} exists — writing ${suggested} for manual merge"
    curl -fsSL "${BASE}/${f}" -o "${suggested}"
    WROTE_SUGGESTED=1
  else
    note "↓ ${f}"
    curl -fsSL "${BASE}/${f}" -o "${f}"
  fi
done

chmod +x hooks/pre-tool-use-contract-check.js hooks/stop-contract-judge.js hooks/stop-contract-keeper.js

say ""
say "✓ Agentic Contract installed."
say ""
say "Next steps:"
say "  1. Read .claude/contracts/master.md and the Schedules (coding.md, ethics.md)."
say "     Tighten the rules for your stack — these are deliberately generic."
if [ "${WROTE_SUGGESTED}" = "1" ]; then
  say "  2. Existing files were preserved; upstream copies were written as"
  say "     *.contract-suggested siblings. Diff each one against its sibling"
  say "     and merge by hand. user-rules.md is your accumulated rule store —"
  say "     never replace it without copying your USR-NNN entries forward."
  say "     The hooks block in settings.json is load-bearing — without it,"
  say "     the PreToolUse and Stop hooks won't run."
fi
say "  3. Restart any running Claude Code session in this directory so the"
say "     new hooks and subagents are picked up."
say ""
say "Docs: https://github.com/${REPO}"
