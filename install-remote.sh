#!/usr/bin/env bash
# Agentic Contract — remote installer.
# Usage:
#   curl -sL https://raw.githubusercontent.com/danlex/agentic-contract/main/install-remote.sh | bash
#
# Run from the root of the project you want to wrap. The script:
#   - Creates .claude/contracts/, .claude/agents/, and hooks/ if they don't exist.
#   - Downloads the contracts, the contract-judge subagent, and both hook scripts.
#   - Makes the hook scripts executable.
#   - For CLAUDE.md and .claude/settings.json, if a file already exists, the
#     contract version is written to a sibling with a `.contract-suggested`
#     suffix so nothing is silently overwritten — merge by hand.

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

# Files that are unique to the contract — safe to overwrite.
OVERWRITE_FILES=(
  ".claude/contracts/coding.md"
  ".claude/contracts/ethics.md"
  ".claude/agents/contract-judge.md"
  "hooks/pre-tool-use-contract-check.js"
  "hooks/stop-contract-judge.js"
)

for f in "${OVERWRITE_FILES[@]}"; do
  note "↓ ${f}"
  curl -fsSL "${BASE}/${f}" -o "${f}"
done

# Files that may conflict — never silently overwrite.
MERGE_FILES=(
  "CLAUDE.md"
  ".claude/settings.json"
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

chmod +x hooks/pre-tool-use-contract-check.js hooks/stop-contract-judge.js

say ""
say "✓ Agentic Contract installed."
say ""
say "Next steps:"
say "  1. Read .claude/contracts/coding.md and .claude/contracts/ethics.md."
say "     Tighten the rules for your stack — these are deliberately generic."
if [ "${WROTE_SUGGESTED}" = "1" ]; then
  say "  2. Merge any *.contract-suggested files into your existing CLAUDE.md /"
  say "     .claude/settings.json. The hooks block in settings.json is the"
  say "     load-bearing bit — without it, the PreToolUse and Stop hooks won't run."
fi
say "  3. Restart any running Claude Code session in this directory so the"
say "     new hooks and subagent are picked up."
say ""
say "Docs: https://github.com/${REPO}"
