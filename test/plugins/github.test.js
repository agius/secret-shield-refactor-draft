'use strict';

const tape = require('tape');

const Shield = require('../../index');
const GithubPlugin = require('../../plugins/github');
const testutils = require('../testutils');

tape('[github-plugin] github token: a31f109905044c2f074c1deadbeef63c01a7b5f0', (t) => {
  const shield = new Shield();
  const ghplug = new GithubPlugin();
  shield.addPlugin(ghplug);

  const findings = shield.processString('github token: a31f109905044c2f074c1deadbeef63c01a7b5f0');

  t.equal(findings.length, 1, 'found a token');
  t.ok(/Github Token/.test('' + findings[0]), 'is a Github Token');
  t.end();
});

tape('[github-plugin] low-entropy github token', (t) => {
  const shield = new Shield();
  const ghplug = new GithubPlugin(); // default entropy should be high enough to exclude
  shield.addPlugin(ghplug);

  const findings = shield.processString('github token: ' + testutils.mkstr(40, 'a'));

  t.equal(findings.length, 0, 'did not find a problem');
  t.end();
});

tape('[github-plugin] custom entropy setting', (t) => {
  const shield = new Shield();
  const ghplug = new GithubPlugin({minEntropy: 0.001});
  shield.addPlugin(ghplug);

  const findings = shield.processString('github token: b' + testutils.mkstr(39, 'a'));

  t.equal(findings.length, 1, 'found a problem');
  t.ok(/ba+/.test(findings[0].toString()), 'finding matched input string');
  t.end();
});
