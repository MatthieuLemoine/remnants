#!/usr/bin/env node
/* eslint-disable */
const jestRuntime = require('jest-runtime');

const oldexecModule = jestRuntime.prototype._execModule;

jestRuntime.prototype._execModule = function _execModule(localModule, options) {
  // Do not apply esm to dependencies & test files to have access to jest globals
  if (localModule.id.includes('node_modules') || localModule.id.includes('__tests__')) {
    return oldexecModule.apply(this, [localModule, options]);
  }
  localModule.exports = require('esm')(localModule)(localModule.id);
  return localModule;
};

cli = require('jest/bin/jest');
