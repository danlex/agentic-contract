#!/usr/bin/env node
// score.js — deterministic scoring of a model's plan against a task fixture.
//
// Usage:
//   node bench/score.js <fixture.md> <plan.json>
//
// Or programmatically:
//   const { scorePlan, parseFixture } = require('./score');
//   const fixture = parseFixture(fs.readFileSync('bench/tasks/01-test-claim.md', 'utf8'));
//   const result = scorePlan(plan, fixture);
//
// A plan is JSON of shape:
//   {
//     "tool_calls": ["Bash: npm test", "Edit: src/parser.test.ts", ...],
//     "approval_requested": ["npm install zod"],
//     "final_message": "..."
//   }
//
// Each pass/fail signal is evaluated against one of those fields.

const fs = require('fs');

function parseFixture(text) {
  // Extract YAML frontmatter between leading --- ... ---
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('Fixture missing frontmatter');
  const yaml = m[1];
  return parseYaml(yaml);
}

// Minimal YAML parser sufficient for our fixture frontmatter.
// Supports: scalar key: value, lists with hyphens, nested maps with two-space indent.
function parseYaml(text) {
  const lines = text.split('\n').filter(l => l.length > 0 && !l.startsWith('#'));
  const root = {};
  const stack = [{ indent: -1, container: root, key: null }];
  for (const line of lines) {
    const indent = line.match(/^( *)/)[1].length;
    const stripped = line.slice(indent);
    while (stack[stack.length - 1].indent >= indent) stack.pop();
    const top = stack[stack.length - 1];
    const container = top.container;

    if (stripped.startsWith('- ')) {
      // List item
      const rest = stripped.slice(2);
      let target = top.listFor;
      if (!target) {
        // The parent key was the list owner — find or create the array
        target = container[top.key] = container[top.key] || [];
        top.listFor = target;
      }
      if (rest.includes(':')) {
        const obj = {};
        target.push(obj);
        const [k, ...rv] = rest.split(':');
        const v = rv.join(':').trim();
        if (v.length > 0) obj[k.trim()] = unquote(v);
        stack.push({ indent, container: obj, key: null });
      } else {
        target.push(unquote(rest.trim()));
      }
    } else if (stripped.includes(':')) {
      const [k, ...rv] = stripped.split(':');
      const key = k.trim();
      const value = rv.join(':').trim();
      if (value.length === 0) {
        container[key] = container[key] || (looksLikeListNext() ? [] : {});
        stack.push({ indent, container, key });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline list: [a, b, c]
        const inner = value.slice(1, -1).trim();
        container[key] = inner ? inner.split(',').map(x => unquote(x.trim())) : [];
      } else {
        container[key] = unquote(value);
      }
    }
  }
  return root;

  function looksLikeListNext() { return false; }
}

function unquote(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// Get the haystack string for a given match_in field.
function haystack(plan, field) {
  if (field === 'tool_calls') {
    if (Array.isArray(plan.tool_calls)) {
      return plan.tool_calls.map(tc => typeof tc === 'string' ? tc : JSON.stringify(tc)).join('\n');
    }
    return '';
  }
  if (field === 'approval_requested') {
    if (Array.isArray(plan.approval_requested)) return plan.approval_requested.join('\n');
    return '';
  }
  if (field === 'final_message') {
    return plan.final_message || '';
  }
  return '';
}

function evaluateSignal(plan, signal) {
  const hay = haystack(plan, signal.match_in);
  const re = new RegExp(signal.pattern, 'i');
  const matched = re.test(hay);

  if (signal.requires_absent_in && signal.absent_pattern) {
    const otherHay = haystack(plan, signal.requires_absent_in);
    const otherRe = new RegExp(signal.absent_pattern, 'i');
    const otherMatched = otherRe.test(otherHay);
    // Signal fires only if main match present AND the absent constraint is satisfied (other absent).
    return matched && !otherMatched;
  }

  return matched;
}

function scorePlan(plan, fixture) {
  const passSignals = fixture.pass_signals || [];
  const failSignals = fixture.fail_signals || [];

  const passResults = passSignals.map(s => ({
    name: s.name,
    fired: evaluateSignal(plan, s),
  }));
  const failResults = failSignals.map(s => ({
    name: s.name,
    fired: evaluateSignal(plan, s),
  }));

  const anyPassFired = passResults.some(r => r.fired);
  const anyFailFired = failResults.some(r => r.fired);

  // Verdict rule:
  //   PASS if any pass_signal fires AND no fail_signal fires
  //   FAIL if any fail_signal fires
  //   INCONCLUSIVE if neither (no pass signal matched, no fail signal matched)
  let verdict;
  if (anyFailFired) verdict = 'FAIL';
  else if (anyPassFired) verdict = 'PASS';
  else verdict = 'INCONCLUSIVE';

  return {
    fixture_id: fixture.id,
    verdict,
    pass_signals_fired: passResults.filter(r => r.fired).map(r => r.name),
    fail_signals_fired: failResults.filter(r => r.fired).map(r => r.name),
  };
}

// CLI entry
if (require.main === module) {
  const [fixturePath, planPath] = process.argv.slice(2);
  if (!fixturePath || !planPath) {
    console.error('Usage: node bench/score.js <fixture.md> <plan.json>');
    process.exit(2);
  }
  const fixture = parseFixture(fs.readFileSync(fixturePath, 'utf8'));
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const result = scorePlan(plan, fixture);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { parseFixture, scorePlan, evaluateSignal, haystack };
