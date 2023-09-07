const snoowrap = require('snoowrap');
const fs = require('fs');

const megaThread2022ID = 'x60ake';
const megaThread2023ID = '163lqu4';
const replyDepth = 2;
const minimumSafeRequestDelay = 400;

const testData = JSON.parse(fs.readFileSync('./testData.json', 'utf8')); // using data from file rather than loading live everytime
let thread; //global variable.  Not ideal but this is how I am doing it until I settle the async portion

function writeCSV() {
  fs.writeFileSync('./output.csv', parseThread(testData));
}

function parseThread(threadData) {
  const csvOut = []; // I really shouldn't be mutating this with subfunctions.  I'll have to refactor this.
  const comments = threadData.comments;

  for (let i = 0; i < comments.length; i++) {
    const topLevelComment = comments[i];
    const category = getCategory(topLevelComment);
    if (category.startsWith('CATEGORY') !== true) {
      continue;
    }

    csvOut.push(` ,${category},${category}`);
    iterateReplies(category, topLevelComment.replies);
    csvOut.push('');
  }

  return csvOut.join('\n');

  function getCategory(topLevelComment) {
    const category = removeCommas(topLevelComment.body);

    return category.startsWith(
      'CATEGORY: Best New Author (published their first'
    )
      ? 'CATEGORY: Best New Author'
      : category;
  }

  function iterateReplies(category, replies) {
    if (category.startsWith('CATEGORY') !== true) {
      return null;
    }

    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      csvOut.push(`${category},${parseBody(reply.body)},${reply.ups}`);
    }
  }

  function parseBody(commentBody) {
    const lines = removeCommas(commentBody).split('\n');
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

  function extractInfoWithRegex(commentBody) {
    const text = removeCommas(commentBody);

    const titleMatch = text.match(/Title: (.+)\n/);
    const authorMatch = text.match(/Author: (.+)\n/);
    const linkMatch = text.match(/Link: (.+)/);

    const title = titleMatch ? titleMatch[1] : '';
    const author = authorMatch ? authorMatch[1] : '';
    const link = linkMatch ? linkMatch[1] : '';

    return `${title},${author},${link}`;
  }
}

function removeCommas(text) {
  return text.replace(/,/g, '');
}

// Extracting every comment on a thread using API wrapper snoowrap
function getThread(threadID, depth = Infinity) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  const r = new snoowrap(JSON.parse(OAuth));

  r.config({
    requestDelay: minimumSafeRequestDelay,
    continueAfterRatelimitError: true,
  });

  console.log('Fetching thread ...');

  r.getSubmission(threadID)
    .expandReplies({ limit: Infinity, depth: depth })
    .then((res) => {
      thread = res.toJSON();
      console.log('Got thread!');
      countComments(thread);
    });
}

function printBody(thread) {
  const comments = thread.comments;

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    console.log(comment.body);
  }
}

function countComments(thread) {
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
