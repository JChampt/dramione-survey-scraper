const snoowrap = require('snoowrap');
const fs = require('fs');

// const megaThread2022ID = 'x60ake';
const megaThread2023ID = '163lqu4';
const replyDepth = 2;
const minimumSafeRequestDelay = 400;

// let thread; //global variable.  Not ideal but this is how I am doing it until I settle the async portion

run();

// Extracting every comment on a thread using API wrapper snoowrap
function run(
  threadID = megaThread2023ID,
  depth = replyDepth,
  requestDelay = minimumSafeRequestDelay
) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  const r = new snoowrap(JSON.parse(OAuth));

  r.config({
    requestDelay: requestDelay,
    continueAfterRatelimitError: true,
  });

  console.log('Fetching thread ...');

  r.getSubmission(threadID)
    .expandReplies({ limit: Infinity, depth: depth })
    .then((res) => {
      const thread = res.toJSON();

      console.log('Got thread!');
      printTotals(thread);
      fs.writeFileSync('./results.csv', makeCSV(thread));
      console.log('Data written to file!');
    });
}

function makeCSV(threadData) {
  const csvOut = [];
  const comments = threadData.comments;

  for (let i = 0; i < comments.length; i++) {
    const topLevelComment = comments[i];
    const category = getCategory(topLevelComment);

    if (category.startsWith('CATEGORY') !== true) continue;

    csvOut.push(` ,${category},${category}`);
    csvOut.push(...iterateReplies(category, topLevelComment.replies));
    csvOut.push('');
  }

  return csvOut.join('\n');

  function getCategory(topLevelComment) {
    const category = removeProblemCharacters(topLevelComment.body);

    return category.startsWith(
      'CATEGORY: Best New Author (published their first'
    )
      ? 'CATEGORY: Best New Author'
      : category;
  }

  function iterateReplies(category, replies) {
    const res = [];

    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      const parsedBody = extractInfoWithRegex(reply.body);

      if (parsedBody.includes('FixMe')) {
        errOut.push(`${category}\n${reply.body}`);
      }
      res.push(`${category},${parsedBody},${reply.ups}`);
    }

    return res;
  }

  function parseBody(commentBody) {
    const lines = removeProblemCharacters(commentBody).split('\n');
    let title, author, link;

    for (const line of lines) {
      if (line.startsWith('Title: ')) {
        title = line.substring('Title: '.length).trim();
      }

      if (line.startsWith('Author: ')) {
        author = line.substring('Author: '.length).trim();
      }

      if (line.startsWith('Link: ')) {
        link = line.substring('Link: '.length).trim();
      }
    }

    return `${title},${author},${link}`;
  }
}

function extractInfoWithRegex(commentBody) {
  const text = removeProblemCharacters(commentBody);

  const isRemoved = text.match(/\[removed\]/);
  if (isRemoved) {
    return `[removed],,`;
  }

  const titleMatch = text.match(/Title *: *(.+)\n/i);
  const authorMatch = text.match(/Author *: *(.+)\n/i);
  const linkMatch = text.match(/Link *: *(.+)/i);

  const title = titleMatch ? titleMatch[1] : 'FixMe';
  const author = authorMatch ? authorMatch[1] : 'FixMe';
  const link = linkMatch ? linkMatch[1] : 'FixMe';

  const output = `${title},${author},${link}`;

  if (output.includes('FixMe'))
    return `FixMe,${text.replace(/[\r\n]+/gm, ' ')},`;

  return output;
}

function removeProblemCharacters(text) {
  return text.replace(/[\*,><]+/gm, '').trim();
}

function printTotals(thread) {
  const comments = thread.comments;
  let totalTopLevelComments = 0;
  let totalComments = 0;

  for (let i = 0; i < comments.length; i++) {
    const topLevelComment = comments[i];
    if (topLevelComment.body.startsWith('CATEGORY') !== true) continue;

    ++totalTopLevelComments;
    totalComments += topLevelComment.replies.length;
  }

  console.log('Total top level comments:', totalTopLevelComments);
  console.log('Total comments:', totalComments);
}

// Testing data and functions
const testData = JSON.parse(fs.readFileSync('./testData.json', 'utf8')); // using data from file rather than loading live everytime
const errOut = [];
// test();
function test() {
  fs.writeFileSync('./output.csv', makeCSV(testData));
  fs.writeFileSync('./err.txt', errOut.join('\n'));
}

function printBody(thread) {
  const comments = thread.comments;

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    console.log(comment.body);
  }
}
