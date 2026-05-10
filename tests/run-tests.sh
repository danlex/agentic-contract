#!/usr/bin/env bash
# Test harness for the agentic-contract project — exercises the installer's
# MERGE_FILES / OVERWRITE_FILES split and the PreToolUse / Stop hook coverage.
#
# Run from anywhere:
#   bash tests/run-tests.sh
#   ./tests/run-tests.sh        # if executable
#
# Self-cleaning: uses mktemp -d and a trap. No project files are modified —
# every file operation happens inside a temporary scratch directory.

set -uo pipefail

# Resolve the repo root from the script's own location so the harness works
# regardless of cwd or who clones it.
REPO=$(cd "$(dirname "$0")/.." && pwd)
TEST_ROOT=$(mktemp -d -t ac-tests-XXXXXX)
trap "rm -rf '$TEST_ROOT'" EXIT

PASS=0
FAIL=0
ok()   { echo "  ✓ $1"; PASS=$((PASS+1)); }
nope() { echo "  ✗ $1"; FAIL=$((FAIL+1)); }
chk()  { [ "$1" = "1" ] && ok "$2" || nope "$2"; }

# Mirror of the installer's arrays (kept in sync with install-remote.sh).
OVERWRITE_FILES=(
  ".claude/agents/contract-judge.md"
  ".claude/agents/contract-keeper.md"
  "hooks/pre-tool-use-contract-check.js"
  "hooks/stop-contract-judge.js"
  "hooks/stop-contract-keeper.js"
)
MERGE_FILES=(
  "CLAUDE.md"
  ".claude/settings.json"
  ".claude/contracts/master.md"
  ".claude/contracts/coding.md"
  ".claude/contracts/ethics.md"
  ".claude/contracts/user-rules.md"
)

# Mirrors install-remote.sh's per-file logic with cp instead of curl.
do_install() {
  local target=$1 wrote=0 f
  for f in "${OVERWRITE_FILES[@]}"; do cp "${REPO}/${f}" "${target}/${f}"; done
  for f in "${MERGE_FILES[@]}"; do
    if [ -e "${target}/${f}" ]; then
      cp "${REPO}/${f}" "${target}/${f}.contract-suggested"; wrote=1
    else
      cp "${REPO}/${f}" "${target}/${f}"
    fi
  done
  echo "$wrote"
}

prep_dir() { mkdir -p "$1/.claude/contracts" "$1/.claude/agents" "$1/hooks"; }

# ============================================================
echo "=== Section 1: installer behaviour"

echo "Test 1.1: fresh install"
T="$TEST_ROOT/fresh"; prep_dir "$T"
W=$(do_install "$T")
ae=1; for f in "${OVERWRITE_FILES[@]}" "${MERGE_FILES[@]}"; do [ -e "$T/${f}" ] || ae=0; done
chk "$ae" "all 11 files written to expected paths"

# Use `find` for portable recursive discovery — Bash 3.x on macOS does not
# support globstar (`**/*`) without explicit shopt, and shopt -s globstar
# silently fails there. find is the lowest common denominator.
sug_count=$(find "$T" -name '*.contract-suggested' | wc -l | tr -d ' ')
[ "$sug_count" = "0" ] && z=1 || z=0
chk "$z" "no .contract-suggested files on fresh install"

[ "$W" = "0" ] && z=1 || z=0
chk "$z" "WROTE_SUGGESTED=0 on fresh install"

echo "Test 1.2: reinstall preserves accumulated USR rules in user-rules.md"
cat >> "$T/.claude/contracts/user-rules.md" <<'EOF'

### USR-001 — Test rule
**Rule:** MUST not be wiped on reinstall.
**Why:** Regression guard for MERGE_FILES change.
**Added:** 2026-05-10
EOF
W=$(do_install "$T")
grep -q "USR-001" "$T/.claude/contracts/user-rules.md" && p=1 || p=0
chk "$p" "user-rules.md still contains USR-001 after reinstall"
[ -e "$T/.claude/contracts/user-rules.md.contract-suggested" ] && s=1 || s=0
chk "$s" "user-rules.md.contract-suggested sibling was written"
[ "$W" = "1" ] && o=1 || o=0
chk "$o" "WROTE_SUGGESTED=1 on reinstall"

echo "Test 1.3: reinstall preserves customized coding.md"
T="$TEST_ROOT/customized"; prep_dir "$T"
do_install "$T" > /dev/null
echo "<!-- CUSTOM RULE FROM USER -->" >> "$T/.claude/contracts/coding.md"
do_install "$T" > /dev/null
grep -q "CUSTOM RULE FROM USER" "$T/.claude/contracts/coding.md" && p=1 || p=0
chk "$p" "coding.md retains user customization"
[ -e "$T/.claude/contracts/coding.md.contract-suggested" ] && s=1 || s=0
chk "$s" "coding.md.contract-suggested sibling was written"

echo "Test 1.4: code-like files (judge, keeper, hooks) overwrite on reinstall"
T="$TEST_ROOT/codelike"; prep_dir "$T"
do_install "$T" > /dev/null
echo "USER_MUTATION_THAT_SHOULD_BE_LOST" >> "$T/.claude/agents/contract-judge.md"
do_install "$T" > /dev/null
grep -q "USER_MUTATION_THAT_SHOULD_BE_LOST" "$T/.claude/agents/contract-judge.md" && m=1 || m=0
[ "$m" = "0" ] && o=1 || o=0
chk "$o" "contract-judge.md was overwritten (mutation gone)"
[ -e "$T/.claude/agents/contract-judge.md.contract-suggested" ] && s=1 || s=0
[ "$s" = "0" ] && n=1 || n=0
chk "$n" "no .contract-suggested for code-like files"

# ============================================================
echo
echo "=== Section 2: PreToolUse hook regex coverage"
HOOK="$REPO/hooks/pre-tool-use-contract-check.js"

run_hook() { echo "$1" | node "$HOOK"; }

echo "Test 2.1: forbidden Bash patterns => deny"
for cmd in \
  'rm -rf / now' \
  'git push --force origin main' \
  'cat .env'; do
  out=$(run_hook "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"$cmd\"}}")
  echo "$out" | grep -q '"permissionDecision":"deny"' && d=1 || d=0
  chk "$d" "deny: $cmd"
done

echo "Test 2.2: needs-approval Bash patterns => ask"
for cmd in \
  'npm install zod' \
  'pip install requests' \
  'git push origin main' \
  'rm -rf node_modules' \
  'kubectl apply -f deploy.yaml'; do
  out=$(run_hook "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"$cmd\"}}")
  echo "$out" | grep -q '"permissionDecision":"ask"' && a=1 || a=0
  chk "$a" "ask: $cmd"
done

echo "Test 2.3: safe Bash patterns => allow (no output)"
for cmd in 'ls -la' 'npm test' 'git status'; do
  out=$(run_hook "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"$cmd\"}}")
  [ -z "$out" ] && al=1 || al=0
  chk "$al" "allow: $cmd"
done

echo "Test 2.4: forbidden file paths => deny"
for path in '.env' 'secrets/aws.json' '/etc/ssl/server.pem'; do
  out=$(run_hook "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$path\"}}")
  echo "$out" | grep -q '"permissionDecision":"deny"' && d=1 || d=0
  chk "$d" "deny: Edit $path"
done

echo "Test 2.5: needs-approval file paths => ask"
for path in 'src/auth/login.ts' '.github/workflows/deploy.yml' 'Dockerfile' 'src/billing/checkout.ts' 'infra/main.tf'; do
  out=$(run_hook "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$path\"}}")
  echo "$out" | grep -q '"permissionDecision":"ask"' && a=1 || a=0
  chk "$a" "ask: Edit $path"
done

echo "Test 2.6: in-scope edits => allow"
for path in 'src/api/user.ts' 'lib/utils.py' 'README.md'; do
  out=$(run_hook "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$path\"}}")
  [ -z "$out" ] && al=1 || al=0
  chk "$al" "allow: Edit $path"
done

# ============================================================
echo
echo "=== Section 3: Stop hooks fail open"
JUDGE="$REPO/hooks/stop-contract-judge.js"
KEEPER="$REPO/hooks/stop-contract-keeper.js"

echo "Test 3.1: missing transcript path => no block"
out=$(echo '{"transcript_path":"/nonexistent","stop_hook_active":false}' | node "$JUDGE")
[ -z "$out" ] && al=1 || al=0
chk "$al" "stop-contract-judge: silent on missing transcript"
out=$(echo '{"transcript_path":"/nonexistent","stop_hook_active":false}' | node "$KEEPER")
[ -z "$out" ] && al=1 || al=0
chk "$al" "stop-contract-keeper: silent on missing transcript"

echo "Test 3.2: stop_hook_active=true => no block (loop guard)"
out=$(echo '{"transcript_path":"/dev/null","stop_hook_active":true}' | node "$JUDGE")
[ -z "$out" ] && al=1 || al=0
chk "$al" "stop-contract-judge: respects stop_hook_active"
out=$(echo '{"transcript_path":"/dev/null","stop_hook_active":true}' | node "$KEEPER")
[ -z "$out" ] && al=1 || al=0
chk "$al" "stop-contract-keeper: respects stop_hook_active"

echo "Test 3.3: malformed JSON => fail open"
out=$(echo 'not-json' | node "$JUDGE" 2>/dev/null)
[ -z "$out" ] && al=1 || al=0
chk "$al" "stop-contract-judge: fails open on bad JSON"

# ============================================================
echo
echo "=== Summary"
echo "$PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
