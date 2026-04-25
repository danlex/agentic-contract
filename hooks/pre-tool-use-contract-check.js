#!/usr/bin/env node
// PreToolUse hook — checks the proposed tool call against .claude/contracts/coding.md.
// Returns "deny" for Forbidden actions, "ask" for Needs-approval actions, otherwise allows.
// Fails open: any internal error exits 0 so the user is never blocked by a buggy hook.

let raw = '';
process.stdin.on('data', c => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const decision = evaluate(input.tool_name, input.tool_input || {});
    if (decision.action === 'allow') return process.exit(0);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision.action,
        permissionDecisionReason: decision.reason,
      },
    }));
    process.exit(0);
  } catch (e) {
    process.stderr.write(`pre-tool-use-contract-check: ${e.message}\n`);
    process.exit(0);
  }
});

function evaluate(tool, input) {
  if (tool === 'Bash') return evaluateBash(input.command || '');
  if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') {
    return evaluatePath(input.file_path || input.notebook_path || '');
  }
  return { action: 'allow' };
}

function evaluateBash(cmd) {
  const forbidden = [
    { p: /\brm\s+-rf?\s+\/(?:\s|$)/, rule: 'rm -rf / is forbidden' },
    { p: /\bgit\s+push\s+[^|;&]*--force\b/, rule: 'force push is forbidden without explicit approval' },
    { p: /\bcat\s+[^|;&]*\.env\b/, rule: 'reading .env files exposes secrets' },
  ];
  for (const { p, rule } of forbidden) {
    if (p.test(cmd)) return deny(`coding.md / Forbidden: ${rule}`);
  }

  const needsApproval = [
    [/\b(npm|pnpm|yarn)\s+(install|add|remove|uninstall|update|upgrade)\b/, 'Install, remove or upgrade dependencies'],
    [/\bpip\s+(install|uninstall)\b/, 'Install, remove or upgrade dependencies'],
    [/\bcargo\s+(add|remove|update)\b/, 'Install, remove or upgrade dependencies'],
    [/\bbundle\s+(install|update)\b/, 'Install, remove or upgrade dependencies'],
    [/\bgo\s+get\b/, 'Install, remove or upgrade dependencies'],
    [/\b(prisma|alembic|knex|sequelize)\b[^|;&]*\bmigrate\b/, 'Run migrations'],
    [/\brake\s+db:migrate\b/, 'Run migrations'],
    [/\bgit\s+push\b/, 'Deployment changes (git push)'],
    [/\b(vercel|netlify|fly|railway)\s+deploy\b/, 'Deployment changes'],
    [/\bkubectl\s+(apply|delete|rollout)\b/, 'Deployment changes'],
    [/\bterraform\s+(apply|destroy)\b/, 'Deployment changes'],
    [/\brm\s+-(?:rf?|fr|r|f)\b/, 'Delete files'],
  ];
  for (const [p, rule] of needsApproval) {
    if (p.test(cmd)) return ask(`coding.md / Needs approval: ${rule}. Read .claude/contracts/coding.md and confirm with the user before proceeding.`);
  }
  return { action: 'allow' };
}

function evaluatePath(path) {
  const lower = path.toLowerCase();
  const forbidden = [
    [/\.env(\..+)?$/, 'Modify secrets (.env)'],
    [/(^|\/)secrets?\//, 'Modify secrets (secrets/ directory)'],
    [/(^|\/)credentials?\.[a-z]+$/, 'Modify secrets (credentials file)'],
    [/\.pem$|\.key$|id_rsa(\.|$)/, 'Modify secrets (key material)'],
  ];
  for (const [p, rule] of forbidden) {
    if (p.test(lower)) return deny(`coding.md / Forbidden: ${rule}`);
  }

  const needsApproval = [
    [/(^|\/)(production|prod)\b/, 'Change production config'],
    [/(^|\/)auth(\b|\/)/, 'Change auth'],
    [/(^|\/)billing(\b|\/)/, 'Change billing'],
    [/(^|\/)security(\b|\/)/, 'Change security'],
    [/\.github\/workflows\//, 'Deployment changes (CI workflow)'],
    [/(^|\/)(dockerfile|docker-compose\.ya?ml)$/, 'Deployment changes'],
    [/\.tf$|(^|\/)terraform\//, 'Deployment changes'],
  ];
  for (const [p, rule] of needsApproval) {
    if (p.test(lower)) return ask(`coding.md / Needs approval: ${rule}. Read .claude/contracts/coding.md and confirm with the user before proceeding.`);
  }
  return { action: 'allow' };
}

function ask(reason) { return { action: 'ask', reason }; }
function deny(reason) { return { action: 'deny', reason }; }
