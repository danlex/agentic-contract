#!/usr/bin/env node
// Stop hook — if the current turn touched files or ran risky commands AND the
// contract-judge subagent has not been invoked yet, block the stop and tell
// Claude to run the judge before finalizing. Loops are prevented by the
// stop_hook_active flag the runtime sets on the second pass.
// Fails open: any internal error exits 0.

const fs = require('fs');

let raw = '';
process.stdin.on('data', c => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    if (input.stop_hook_active) return process.exit(0);

    const entries = readTranscript(input.transcript_path);
    if (!entries.length) return process.exit(0);

    const turn = entriesSinceLastUserTurn(entries);
    const risky = hadRiskyAction(turn);
    const judged = wasJudgeInvoked(turn);

    if (risky && !judged) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason:
          'Contract Judge required: this turn changed files or ran risky commands. ' +
          'Before final delivery, invoke the contract-judge subagent (Task tool, ' +
          'subagent_type "contract-judge") to review the work against ' +
          '.claude/contracts/coding.md and .claude/contracts/ethics.md. ' +
          'If the judge returns PASS, you may stop. If ASK APPROVAL or FAIL, follow its recovery instruction.',
      }));
      return process.exit(0);
    }
    process.exit(0);
  } catch (e) {
    process.stderr.write(`stop-contract-judge: ${e.message}\n`);
    process.exit(0);
  }
});

function readTranscript(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

function entriesSinceLastUserTurn(entries) {
  let idx = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type === 'user' && !isToolResult(entries[i])) { idx = i; break; }
  }
  return entries.slice(idx + 1);
}

function hadRiskyAction(entries) {
  for (const e of entries) {
    for (const t of toolUses(e)) {
      if (['Edit', 'Write', 'NotebookEdit'].includes(t.name)) return true;
      if (t.name === 'Bash') {
        const cmd = (t.input && t.input.command) || '';
        if (/\b(rm|npm|pnpm|yarn|pip|cargo|bundle|migrate|deploy|kubectl|terraform)\b/.test(cmd)) return true;
        if (/\bgit\s+(push|reset\s+--hard|rebase)\b/.test(cmd)) return true;
      }
    }
  }
  return false;
}

function wasJudgeInvoked(entries) {
  for (const e of entries) {
    for (const t of toolUses(e)) {
      if (t.name !== 'Task' && t.name !== 'Agent') continue;
      const sub = (t.input && (t.input.subagent_type || t.input.subagentType)) || '';
      if (sub === 'contract-judge') return true;
    }
  }
  return false;
}

function toolUses(entry) {
  const c = entry.message && entry.message.content;
  if (!Array.isArray(c)) return [];
  return c.filter(x => x && x.type === 'tool_use').map(x => ({ name: x.name, input: x.input }));
}

function isToolResult(entry) {
  const c = entry.message && entry.message.content;
  if (!Array.isArray(c)) return false;
  return c.some(x => x && x.type === 'tool_result');
}
