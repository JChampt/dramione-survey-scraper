const snoowrap = require('snoowrap');
const fs = require('fs');

const megaThread2022ID = 'x60ake';
const megaThread2023ID = '163lqu4';

let thread;
getThread(megaThread2023ID, 2);

// let [title, , author, , link] = commentsJSON.comments[2].replies[0].body.split('\n');
// deconstruct the body of a reply.  I can't address the commments json until it is done fetching via API though, so I probably need to put
// a delay here that checks to see if data has been gotten yet, and if not to wait half a second and try again.

// Extracting every comment on a thread using API wrapper snoowrap
function getThread(threadID, depth = Infinity) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  const r = new snoowrap(JSON.parse(OAuth));

  r.config({
    requestDelay: 300,
    continueAfterRatelimitError: true,
  });

  r.getSubmission(threadID)
    .expandReplies({ limit: Infinity, depth: depth })
    .then((res) => {
      thread = res.toJSON();
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

  console.log(count);
}
