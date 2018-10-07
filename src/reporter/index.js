import path from 'path';
import chalk from 'chalk';

export const filesReport = (
  projectRoot,
  sourceDirectories,
  filesByDirectory,
) => {
  const allFiles = filesByDirectory.reduce(
    (array, item) => array.concat(item),
    [],
  );
  if (!allFiles.length) {
    process.stdout.write(chalk.green('\n✅ No unused source files found\n'));
    return;
  }
  process.stdout.write(
    chalk.red(`\n❌ ${allFiles.length} unused source files found.\n`),
  );
  filesByDirectory.forEach((files, index) => {
    const directory = sourceDirectories[index];
    const relative = path.relative(projectRoot, directory);
    process.stdout.write(chalk.blue(`\n● ${relative}\n`));
    files.map(file => process.stdout.write(
      chalk.yellow(`    • ${path.relative(directory, file)}\n`),
    ));
  });
};

export const dependenciesReport = (unusedDependencies) => {
  if (!unusedDependencies.length) {
    process.stdout.write(chalk.green('\n✅ No unused dependencies found.\n'));
    return;
  }
  process.stdout.write(
    chalk.red(
      `\n❌ ${unusedDependencies.length} unused dependencies found.\n\n`,
    ),
  );
  unusedDependencies.forEach(dep => process.stdout.write(chalk.yellow(`    • ${dep}\n`)));
};
