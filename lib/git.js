'use strict';

const helpers = require('./helpers');

const git = {};

git.RepoNotFoundError = helpers.createError('RepoNotFoundError');

git.currentRepo = function currentRepo(dir) {
  dir = path.resolve(dir || process.cwd());
  return helpers.execAsync('git rev-parse --show-toplevel', {cwd: dir}).then((out) => {
    const gitDir = out.stdout.trim();
    if(!gitDir) {
      throw new RepoNotFoundError('Could not find repo in directory: ' + dir, {dir: dir});
    }
    return out.stdout.trim();
  });
};

git.diffHere = function diffHere(dir) {
  return this.currentRepo(dir).then((repoDir) => {
    return helpers.execAsync('git diff -U0', {cwd: repoDir});
  });
};

git.addLocalPrecommitHook = function addLocalPrecommitHook(dir) {
  return this.currentRepo(dir).then((repoDir) => {
    return helpers.statAsync(path.resolve(repoDir, '.git', 'hooks', 'pre-commit'));
  }).catch((err) => {
    if(err.code === 'ENOENT') {
      // create pre-commit hook
    } else {
      throw err;
    }
  }).then((stats) => {
    // append or insert pre-commit hook
  });
};

module.exports = git;
