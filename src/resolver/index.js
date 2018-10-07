import path from 'path';
import fs from 'fs';
import { compose } from 'conductor';

const extensions = ['.js', '.json', '.graphql', '.jsx'];
const imageExtensions = ['.png', '.jpg', '.jpeg'];
const indexFiles = [
  'index.js',
  'index.android.js',
  'index.ios.js',
  'index.web.js',
];
const importRegex = /from '(.*)'/g;
const requireRegex = /require\('(.*)'\)/g;
const commentRegex = /\/\/.*|\/\*.*\*\//g;
const graphqlImportRegex = /#import "(.*)"/g;
const usedFiles = {};
const usedDependencies = {};

const withExtensions = absolutePath => extensions.map(extension => `${absolutePath}${extension}`);
const withIndex = absolutePath => indexFiles.map(file => path.join(absolutePath, file));

const resolve = sourcePath => (relativePath) => {
  const absolutePath = path.join(sourcePath, relativePath);
  let paths = [];
  // isFile
  try {
    fs.readdirSync(absolutePath);
  } catch (e) {
    paths.push(absolutePath);
    const ext = path.extname(absolutePath);
    if (imageExtensions.includes(ext)) {
      paths.push(absolutePath.replace(ext, `@2x${ext}`));
      paths.push(absolutePath.replace(ext, `@3x${ext}`));
    }
  }
  paths = [
    ...paths,
    ...withExtensions(absolutePath),
    ...withIndex(absolutePath),
  ];
  const founds = paths.filter(fs.existsSync);
  return founds;
};

const findImports = filePaths => filePaths.map((filePath) => {
  if (usedFiles[filePath]) {
    return [];
  }
  usedFiles[filePath] = true;
  const content = fs
    .readFileSync(filePath, { encoding: 'utf8' })
    .replace(commentRegex, '');
  const founds = [];
  let found = importRegex.exec(content);
  while (found) {
    if (found[1][0] === '.') {
      founds.push(found[1]);
    } else {
      usedDependencies[found[1]] = true;
    }
    found = importRegex.exec(content);
  }
  found = requireRegex.exec(content);
  while (found) {
    if (found[1][0] === '.') {
      founds.push(found[1]);
    } else {
      usedDependencies[found[1]] = true;
    }
    found = requireRegex.exec(content);
  }
  found = graphqlImportRegex.exec(content);
  while (found) {
    founds.push(found[1]);
    found = graphqlImportRegex.exec(content);
  }
  return founds.map(resolveImports(path.dirname(filePath)));
});

function resolveImports(dirname) {
  return compose(
    findImports,
    resolve(dirname),
  );
}

export default (projectRoot) => {
  resolveImports(projectRoot)('');
  return {
    usedFiles,
    usedDependencies,
  };
};
