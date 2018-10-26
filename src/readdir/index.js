import deglob from 'deglob';
import { promisify } from 'util';

const readdir = promisify(deglob);

export default (sources, exclude) => Promise.all(
  sources.map(directory => readdir('**/*', {
    cwd: directory,
    ignore: exclude,
    useGitIgnore: true,
  })),
);
