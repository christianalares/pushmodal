const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');

for (const entry of ['.', './core', './react']) {
  const files = pkg.exports[entry];
  for (const file of Object.values(files)) {
    assert.ok(existsSync(path.join(root, file)), `Missing ${file}`);
  }

  for (const kind of ['require', 'import', 'types']) {
    const source = readFileSync(path.join(root, files[kind]), 'utf8');
    assert.ok(!source.includes('@base-ui/') && !source.includes('@radix-ui/'),
      `${entry} ${kind} depends on a UI library`);
    if (entry === './react' && kind !== 'types') {
      assert.match(source, /^['"]use client['"];?/, 'React entry needs a client directive');
    }
    if (entry !== './react') {
      assert.ok(!source.includes('react-dom') && !source.includes('react/jsx-runtime'),
        `${entry} ${kind} depends on React`);
    }
  }
}

const result = spawnSync(process.execPath, ['-e', `
  const assert = require('node:assert/strict');
  const Module = require('node:module');
  const load = Module._load;
  Module._load = function (id, ...args) {
    if (id === 'react' || id.startsWith('react/') || id.startsWith('react-dom')) {
      throw new Error('Core loaded React: ' + id);
    }
    return load.call(this, id, ...args);
  };
  for (const path of ['pushmodal', 'pushmodal/core']) {
    const api = require(path);
    const { dialogs } = api.createDialogs({ sheets: { dialogs: { edit: api.defineDialog() } } });
    const instance = dialogs.sheets.edit.push();
    assert.equal(dialogs.sheets.pop(), instance);
  }
`], { cwd: root, encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr);
assert.equal(typeof require('pushmodal/react').createDialogs, 'function');
console.log('Package entry points are present and the core loads without React or a UI library.');
