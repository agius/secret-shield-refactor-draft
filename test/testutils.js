'use strict';

function mkstr(len, fill) {
  return new Buffer(len).fill(fill).toString();
}

module.exports = {
  mkstr: mkstr
};
