import path from 'path';
import yargs from 'yargs';
import ora from 'ora';
import { filesReport, dependenciesReport } from './reporter';
import resolve from './resolver';
import readdir from './readdir';

const { argv } = yargs.array('sourceDirectories');

const {
  projectRoot: relativeRoot = process.cwd(),
  sourceDirectories = [],
} = argv;

const projectRoot = path.resolve(relativeRoot);
const manifest = require(path.join(projectRoot, 'package.json'));

if (!sourceDirectories.length) {
  process.stderr.write('Missing required argument --sourceDirectories\n');
  process.exit(1);
}

const spinner = ora('Looking for remnants').start();

const { usedFiles, usedDependencies } = resolve(projectRoot);

(async () => {
  const files = await readdir(sourceDirectories);
  const unusedDependencies = [
    ...Object.keys(manifest.dependencies || {}),
  ].filter(item => !usedDependencies[item]);
  const unusedFiles = files.map(item => item.filter(filePath => !usedFiles[path.join(projectRoot, filePath)]));
  spinner.stop();
  filesReport(projectRoot, sourceDirectories, unusedFiles);
  dependenciesReport(unusedDependencies);
})();
