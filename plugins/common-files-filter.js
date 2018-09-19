'use strict';

const regexes = [
  /\.git\//,
  /node_modules\//,
  /\.idea\//,
  /vendor\//,
  /\.vscode\//,
  /\.tm2\//,
  /\.tm2source\//,
  /Frameworks\//,
  /\.gitignore/,
  /package-lock\.json/,
  /Podfile.lock/,
  /yarn\.lock/,
  /manifest\.json/,
  /jquery.*\.min\.js/i,
  /\/vendor\//
];

const fileExtensions = [
  'png',
  'pbf',
  'mvp',
  'webp',
  'otf',
  'DS_Store',
  'svg',
  'pdf',
  'numbers',
  'indd',
  'enc',
  'css',
  'jpeg',
  'jpg',
  'JGP',
  'mp4',
  'snap',
  'mov',
  'gif'
].map(e => '.' + e);

function fileFilter(file) {
  const matchesFilterPattern = regexes.find(r => r.test(file.path));
  if(matchesFilterPattern) return true;

  const matchesFilteredExt = fileExtensions.indexOf(file.getExt()) !== -1;
  if(matchesFilteredExt) return true;

  return false;
}

module.exports = {
  fileFilter: fileFilter
};
