'use strict';

const path = require('path');

const tape = require('tape');

const helpers = require('../../lib/helpers');

tape('[helpers] ExampleError initializes', (t) => {
  const ExampleError = helpers.createError('ExampleError');
  const err = new ExampleError('example message');
  t.ok(err instanceof ExampleError, 'is instanceof custom name');
  t.ok(err instanceof Error, 'is instanceof js base error');
  t.equal(err.message, 'example message', 'sets error message');
  t.ok(err.stack.length > 0, 'has a stack trace');

  const regex = new RegExp(path.resolve(__dirname));
  t.ok(regex.test(err.stack.split('\n')[1]), 'stack trace is here');

  t.end();
});

tape('[helpers] ExampleError throws', (t) => {
  const ExampleError = helpers.createError('ExampleError');
  try {
    throw new ExampleError('example message', {isExample: true});
  } catch(err) {
    t.ok(err instanceof ExampleError, 'is instanceof custom name');
    t.ok(err instanceof Error, 'is instanceof js base error');
    t.equal(err.message, 'example message', 'sets error message');
    t.ok(err.stack.length > 0, 'has a stack trace');
    t.ok(err.isExample, 'sets custom info properties');

    const regex = new RegExp(path.resolve(__dirname));
    t.ok(regex.test(err.stack.split('\n')[1]), 'stack trace is here');

    t.end();
  }
});
