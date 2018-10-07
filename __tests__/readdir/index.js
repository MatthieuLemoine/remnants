const path = require('path');
const { default: readdir } = require('../../src/readdir');

const sourceDirectory = path.join(__dirname, '..', '..', 'src');
const sourceDirectories = [sourceDirectory];

describe('readdir', () => {
  test('should list all files recursively', async () => {
    const files = await readdir(sourceDirectories);
    expect(files[0].sort()).toEqual([
      path.join(sourceDirectory, 'index.js'),
      path.join(sourceDirectory, 'readdir', 'index.js'),
      path.join(sourceDirectory, 'reporter', 'index.js'),
      path.join(sourceDirectory, 'resolver', 'index.js'),
    ]);
  });
});
