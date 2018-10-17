'use strict';

const path = require('path');
const fs = require('fs');

const helpers = require('./helpers');

const git = {};

git.RepoNotFoundError = helpers.createError('RepoNotFoundError');
git.GlobalHooksExistError = helpers.createError('GlobalHooksExistError');

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

git.createPrecommitHook = function createPrecommitHook(destPath) {
  const srcPath = path.resolve(__dirname, '..', 'hooks', 'pre-commit.local');
  fs.linkSync(srcPath, destPath);
  return true;
};

git.updatePrecommitHook = function updatePrecommitHook(destPath) {
  const contents = fs.readFileSync(destPath);

  // if secret-shield is already installed to local pre-commit hook,
  // don't double-install and run it twice for every commit
  const regex = /shield diff/ig;
  if(regex.test(contents)) return;

  // else append secret-shield checks to current pre-commit hooks
  const srcPath = path.resolve(__dirname, '..', 'hooks', 'pre-commit.local');
  const preCommitContents = fs.readFileSync(srcPath).toString();

  fs.writeFileSync(destPath, preCommitContents);
  return true;
};

git.addLocalPrecommitHook = function addLocalPrecommitHook(dir) {
  let destPath;

  return this.currentRepo(dir).then((repoDir) => {
    destPath = path.resolve(repoDir, '.git', 'hooks', 'pre-commit');
    return helpers.statAsync(destPath);
  }).then((stats) => {

    // the .then() will be skipped if the file does not exist because
    // statAsync() will throw an exception; instead of updating the local
    // commit we will skip to the .catch() block below and create a new
    // local pre-commit hook

    return git.updatePrecommitHook(destPath);

  }).catch((err) => {

    // if statAsync() did not find the file, create it
    if(err.code === 'ENOENT') {
      return git.createPrecommitHook(destPath);
    } else {
      // if there was some other error, re-throw to fail out
      throw err;
    }

  });
};

git.addGlobalPrecommitHook = function addGlobalPrecommitHook() {
  const hooksPath = path.resolve(__dirname, '..', 'hooks');
  const linkCmd = 'git config --global core.hooksPath ' + hooksPath;

  const checkCmd = 'git config --global --get core.hooksPath';

  return helpers.execAsync(checkCmd).then((output) => {
    // if global hooks already exist, fail
    // user has their own config set up, and we can't guess what it is

    const errMsg = [
      'Global hooks already found at:',
      output.stdout,
      'shield will not clobber your existing hook setup.'
    ].join('\n');

    throw new GlobalHooksExistError(errMsg, { code: 201 });
  }).catch((err) => {
    if(err instanceof GlobalHooksExistError) throw err;

    // code 128 is: `fatal: unable to read config file`
    // ie, no global or user-level .gitconfig exists

    // code 1 is empty output; ie, config value not set

    // in either case, we can take over the global hooks
    if(err.code === 128 || err.code === 1) {
      return helpers.execAsync(linkCmd);
    } else {
      throw err;
    }
  });
};

module.exports = git;
