#!/usr/bin/env node
// Stop hook — if the latest user message contains an explicit rule-capture trigger
// AND the contract-keeper subagent has not been invoked yet, block the stop and
// tell Claude to invoke the keeper before finalizing. Loops are prevented by the
// stop_hook_active flag the runtime sets on the second pass.
// Fails open: any internal error exits 0.

const fs = require('fs');

const TRIGGER = /(^|\s)\/remember\b|\b(remember(\s+this|\s+that)?|add\s+to\s+contract|contract\s+rule|add\s+rule)\s*:/i;

let raw = '';
process.stdin.on('data', c => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    if (input.stop_hook_active) return process.exit(0);

    const entries = readTranscript(input.transcript_path);
    if (!entries.length) return process.exit(0);

    const lastUser = lastUserMessageText(entries);
    if (!lastUser || !TRIGGER.test(lastUser)) return process.exit(0);

    const turn = entriesSinceLastUserTurn(entries);
    if (wasKeeperInvoked(turn)) return process.exit(0);

    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason:
        'Contract Keeper required: the user message contains an explicit rule-capture trigger ' +
        '(e.g. "/remember", "remember:", "add to contract:"). Before final delivery, invoke the ' +
        'contract-keeper subagent (Task tool, subagent_type "contract-keeper") to draft the ' +
        'candidate rule. After it returns, present the proposal and wait for explicit user ' +
        'approval before appending to .claude/contracts/user-rules.md.',
    }));
    process.exit(0);
  } catch (e) {
    process.stderr.write(`stop-contract-keeper: ${e.message}\n`);
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

function lastUserMessageText(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type !== 'user' || isToolResult(e)) continue;
    const c = e.message && e.message.content;
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) {
      return c.filter(x => x && x.type === 'text').map(x => x.text || '').join('\n');
    }
    return '';
  }
  return '';
}

function entriesSinceLastUserTurn(entries) {
  let idx = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type === 'user' && !isToolResult(entries[i])) { idx = i; break; }
  }
  return entries.slice(idx + 1);
}

function wasKeeperInvoked(entries) {
  for (const e of entries) {
    for (const t of toolUses(e)) {
      if (t.name !== 'Task' && t.name !== 'Agent') continue;
      const sub = (t.input && (t.input.subagent_type || t.input.subagentType)) || '';
      if (sub === 'contract-keeper') return true;
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
