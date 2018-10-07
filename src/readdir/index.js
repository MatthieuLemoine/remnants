import recursive from 'recursive-readdir';

export default (sources, exclude) => Promise.all(sources.map(directory => recursive(directory, exclude)));
