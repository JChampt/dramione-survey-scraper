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

function removeCommas(text) {
  return text.replace(/,/g, '');
}

function parseThread(threadData) {
  const csvOut = [];
  const comments = threadData.comments;

  for (let i = 0; i < comments.length; i++) {
    const topLevelComment = comments[i];
    const category = getCategory(topLevelComment);

    iterateReplies(category, topLevelComment.replies);
  }

  return csvOut.join('\n');

  function getCategory(topLevelComment) {
    // const category = topLevelComment.body.replace(/,/g, '');
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

    csvOut.push('');
  }

  function parseBody(commentBody) {
    // "Title: How Soon is Now?\n\nAuthor: Nelpher\n\nLink: https://archiveofourown.org/works/11561607"
    const lines = commentBody.split('\n');
    let title, author, link;

    for (const line of lines) {
      if (line.startsWith('Title: ')) {
        title = line.substring('Title: '.length).trim();
        title = removeCommas(title);
      }

      if (line.startsWith('Author: ')) {
        author = line.substring('Author: '.length).trim();
        author = removeCommas(author);
      }

      if (line.startsWith('Link: ')) {
        link = line.substring('Link: '.length).trim();
        link = removeCommas(link);
      }
    }

    return `${title},${author},${link}`;
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
