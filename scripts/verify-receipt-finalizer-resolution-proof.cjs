const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const actionPath = path.join(
  root,
  '.github/actions/receipt-finalizer-resolution-proof/action.yml',
);
const action = fs.readFileSync(actionPath, 'utf8');

assert.match(action, /^name: Receipt finalizer resolution proof$/m);
assert.match(action, /^ {2}using: composite$/m);
assert.match(action, /\^\(Sigil-Core\|SigilWatch\)\/\[A-Za-z0-9\._-\]\+\$/);
assert.doesNotMatch(action, /deployment|receipt-resolution|origin-gate/i);
assert.doesNotMatch(action, /secrets\.|github\.token|permissions:/i);

console.log('receipt finalizer resolution proof is minimal');
