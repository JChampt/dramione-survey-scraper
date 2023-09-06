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
  const csvOut = [];
  const comments = threadData.comments;

  for (let i = 0; i < comments.length; i++) {
    const rootComment = comments[i];
    const category = getCategory(rootComment);

    iterateReplies(category, rootComment.replies);
  }

  return csvOut.join('\n');

  function getCategory(rootComment) {
    const category = rootComment.body;

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
      csvOut.push(`${category},${parseBody(reply)}`);
    }

    csvOut.push('\n');
  }

  function parseBody(commentBody) {
    return 'title,author,link,ups';
  }
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
  let count = 0;

  for (let i = 0; i < comments.length; i++) {
    count += comments[i].replies.length;
  }

  console.log('Total comments:', count);
}
