'use strict';

/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');
const proc = require('child_process');

const program = require('commander');

const Shield = require('../index');
const DefaultConfig = require('./default-configs');
const git = require('./git');

function CLI(options) {
  options = options || {};
  this.shield = new Shield();
  this.config = new DefaultConfig(options.config);
  for(const plug of this.config.getPlugins()) {
    this.shield.addPlugin(plug);
  }
}

CLI.prototype.runString = function runString(input) {
  return this.runWrapped(() => {
    const preprocessed = this.shield.preprocessString(input);
    return this.shield.processString(preprocessed);
  });
};

CLI.prototype.runFile = function runFile(filename) {
  const fpath = path.resolve(filename);
  return this.runWrapped(() => {
    return this.shield.processFile(fpath)
  });
};

CLI.prototype.runDir = function runDir(directory) {
  const dirpath = path.resolve(directory);
  return this.runWrapped(() => {
    return this.shield.processDirectory(dirpath);
  });
};

CLI.prototype.runRepo = function runRepo(repo) {
  return this.runWrapped(() => {
    return this.shield.processRemoteRepo(repo)
  });
};

CLI.prototype.runDiff = function runDiff(dir) {
  return this.runWrapped(() => {
    return git.diffHere(dir).then((out) => {
      return this.shield.processDiff(out.stdout);
    });
  });
};

CLI.prototype.runWrapped = function runWrapped(fn) {
  return Promise.resolve().then(() => {
    return fn.call(this);
  }).then((findings) => {
    if(findings && findings.length > 0) return this.handleFindings(findings);
    return this.handleSuccess();
  }).catch((err) => {
    return this.handleError(err);
  });
};

CLI.prototype.handleSuccess = function handleSuccess() {
  console.log('No secrets found!');
};

CLI.prototype.handleFindings = function handleFindings(findings) {
  for(const finding of findings) {
    console.error(finding.toString());
  }
  process.exit(1);
};

CLI.prototype.handleError = function handleError(err) {
  console.error(err);
  process.exit(1);
};

CLI.prototype.addHook = function addHook(dir, opts) {
  opts = opts || {};

  if(opts.global) {
    return git.addGlobalPrecommitHook().then((output) => {
      console.log('Global hook installed!');
    }).catch((err) => {
      if(err instanceof git.GlobalHooksExistError) {
        console.log(err.message);
        return;
      }
      console.error(err);
      process.exit(1);
    });
  } else {
    return git.addLocalPrecommitHook(dir).then((result) => {
      if(result) {
        console.log('Hook added to repo!');
      } else {
        console.log('Hooks already exists, not added.');
      }
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
};

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkgContents = fs.readFileSync(pkgPath).toString();
const packageJson = JSON.parse(pkgContents);

program.version(packageJson.version)
  .option('-C --config <precommit|minimal|deep|verydeep>', 'Set rules to use', 'deep');

program.command('scan <string>')
  .description('scan a string for secrets')
  .action((input, options) => {
    const cli = new CLI(options);
    cli.runString(input);
  });

program.command('file <file>')
  .description('scan a file for secrets')
  .action((file, options) => {
    const cli = new CLI(options);
    cli.runFile(file);
  });

program.command('directory [dir]')
  .alias('dir')
  .description('scan all files in a directory for secrets (recursive)')
  .action((dir, options) => {
    dir = dir || process.cwd();
    const cli = new CLI(options);
    cli.runDir(dir);
  });

program.command('repository <repo>')
  .alias('repo')
  .description('clone a repo and scan it for secrets')
  .action((repo, options) => {
    const cli = new CLI(options);
    cli.runRepo(repo);
  });

program.command('diff [dir]')
  .description('scan git diff in current [dir] (default: current working directory)')
  .action((dir, options) => {
    const cli = new CLI(options);
    cli.runDiff(dir);
  });

program.command('hook [dir]')
  .option('-g --global', 'Set global git hook instead of per-repo')
  .description('Create a git hook for the repo in [dir] to run shield before each commit')
  .action((dir, options) => {
    const cli = new CLI(options);
    cli.addHook(dir, options);
  });

CLI.program = program;

module.exports = CLI;

/* eslint-enable no-console */
