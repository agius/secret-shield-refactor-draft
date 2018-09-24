'use strict';

const path = require('path');
const fs = require('fs');
const proc = require('child_process');
const os = require('os');

const File = require('./file');

function flatten(arr) {
  return [].concat.apply([], arr);
}

function statAsync(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if(err) return reject(err);
      return resolve(stats);
    });
  });
}

function readdirAsync(dirpath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, files) => {
      if(err) return reject(err);
      return resolve(files);
    });
  });
}

function recurseDir(dirpath) {
  return readdirAsync(dirpath).then((files) => {
    const proms = [];

    for(const f of files) {
      const filepath = path.resolve(dirpath, f);

      // what do we do with this file
      const prom = statAsync(filepath).then((stats) => {
        if(stats.isDirectory()) {
          return recurseDir(filepath);
        } else if(stats.isFile()) {
          const fileObj = new File({path: filepath, stats: stats});
          return [fileObj];
        }
      });
      proms.push(prom);
    }

    return Promise.all(proms).then((fileObjs) => {
      return flatten(fileObjs);
    });
  });
}

function execAsync(cmd, options) {
  return new Promise((resolve, reject) => {
    proc.exec(cmd, options, (err, stdout, stderr) => {
      if(err) {
        err.cmd = cmd;
        err.stdout = stdout;
        err.stderr = stderr;
        return reject(err);
      }

      return resolve({
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

// https://gist.github.com/LeverOne/1308368
function uuid(a, b) {
  for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');
  return b;
}

// node 4.3.2 doesn't have mkdtemp
// https://nodejs.org/docs/latest-v4.x/api/fs.html#fs_fs_mkdtemp_prefix_callback
// https://nodejs.org/docs/v4.3.2/api/fs.html
function tmpdAsync() {
  return new Promise((resolve, reject) => {
    const folder = path.resolve(os.tmpdir(), 'secret-shield-' + uuid());
    fs.mkdir(folder, (err) => {
      if(err) return reject(err);

      return resolve(folder);
    });
  });
}

// https://github.com/mrDarcyMurphy/node-rmrf/blob/7e770b247fda349100ee2bd0a5caa4ed1e765f42/index.js
function rmrfSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath)
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const filePath = dirPath + '/' + files[i]
        if (fs.lstatSync(filePath).isDirectory()){
          rmrfSync(filePath)
        } else {
          fs.unlinkSync(filePath)
        }
      }
    }
    fs.rmdirSync(dirPath)
  }
}

// https://gist.github.com/radekk/3d9923cb54e8c0ac7ca55cdc319dd363
function entropy(str) {
  const set = {};

  str.split('').forEach(
    c => (set[c] ? set[c]++ : (set[c] = 1))
  );

  return Object.keys(set).reduce((acc, c) => {
    const p = set[c] / str.length;
    return acc - (p * (Math.log(p) / Math.log(2)));
  }, 0);
};

module.exports = {
  recurseDir: recurseDir,
  statAsync: statAsync,
  readdirAsync: readdirAsync,
  flatten: flatten,
  execAsync: execAsync,
  tmpdAsync: tmpdAsync,
  entropy: entropy,
  rmrfSync: rmrfSync,
  uuid: uuid
};
