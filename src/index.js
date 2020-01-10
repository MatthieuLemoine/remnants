import path from 'path';
import yargs from 'yargs';
import ora from 'ora';
import fs from 'fs-extra';
import chalk from 'chalk';
import { filesReport, dependenciesReport } from './reporter';
import resolve from './resolver';
import readdir from './readdir';

const { argv } = yargs.array('sourceDirectories').array('exclude');

const {
  projectRoot: relativeRoot = process.cwd(),
  sourceDirectories = [],
  remove,
  exclude = [],
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
  const directories = await readdir(sourceDirectories, exclude);
  const unusedDependencies = [
    ...Object.keys(manifest.dependencies || {}),
  ].filter(item => !usedDependencies[item]);
  const unusedFiles = directories.map(files => files.filter(filePath => !usedFiles[path.join(projectRoot, filePath)]));
  spinner.stop();
  filesReport(projectRoot, sourceDirectories, unusedFiles);
  dependenciesReport(unusedDependencies);
  if (remove) {
    const filesToDelete = unusedFiles.reduce(
      (acc, files) => [...acc, ...files],
      [],
    );
    await Promise.all(filesToDelete.map(file => fs.remove(file)));
    process.stdout.write(
      chalk.green(`\n🔥 ${filesToDelete.length} files deleted.\n`),
    );
  }
})();
