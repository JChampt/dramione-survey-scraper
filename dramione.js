const snoowrap = require('snoowrap');
const fs = require('fs');

const megaThread2022ID = 'x60ake';
const megaThread2023ID = '163lqu4';

let commentsJSON;
getComments(megaThread2023ID, 2);

// let [title, , author, , link] = commentsJSON.comments[2].replies[0].body.split('\n');
// deconstruct the body of a reply.  I can't address the commments json until it is done fetching via API though, so I probably need to put
// a delay here that checks to see if data has been gotten yet, and if not to wait half a second and try again.

// Extracting every comment on a thread using API wrapper snoowrap
function getComments(submissionID, depth = Infinity) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  const r = new snoowrap(JSON.parse(OAuth));

  r.config({
    requestDelay: 300,
    continueAfterRatelimitError: true,
  });

  r.getSubmission(submissionID)
    .expandReplies({ limit: Infinity, depth: depth })
    .then((res) => {
      commentsJSON = res.toJSON();
    });
}

const sampleCSV = 'a,b,c,\nd,e,f';
function writeToFile(text) {
  fs.writeFileSync('./output.csv', text);
}

function printBody(threadJson) {
  for (let i = 0; i < threadJson.comments.length; i++) {
    const comment = threadJson.comments[i];
    console.log(comment.body);
  }
}

function countComments(json) {
  let count = 0;
  const comments = json.comments;

  for (let i = 0; i < comments.length; i++) {
    count += comments[i].replies.length;
  }

  console.log(count);
}
