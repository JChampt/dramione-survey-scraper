const fs = require('fs');

const filePath = 'redditAPICommentTree.json';
const regexPattern = /"in[0-9a-z]{5}"/g;

const matchedResults = extractMatchesFromFile(filePath, regexPattern);
console.log('Matched Results:', matchedResults);

function extractMatchesFromFile(filePath, regexPattern) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const matches = data.match(new RegExp(regexPattern, 'g'));
    return matches || [];
  } catch (error) {
    console.error('Error reading or processing the file:', error.message);
    return [];
  }
}
