const snoowrap = require('snoowrap');
const fs = require('fs');

const thread = 'x60ake'; // 2022 Megathread ID

// Extracting every comment on a thread using API wrapper snoowrap
function getComments(thread, depth = 2) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  const r = new snoowrap(JSON.parse(OAuth));

  r.config({
    requestDelay: 300,
    continueAfterRatelimitError: true,
  });

  return r
    .getSubmission(thread)
    .expandReplies({ limit: Infinity, depth: depth });
}

let json;

function run(d = 2) {
  getComments(thread, d).then((res) => {
    json = res.toJSON();
  });
}

function getCount(j) {
  let count = 0;
  const comments = j.comments;

  for (let i = 0; i < comments.length; i++) {
    count += comments[i].replies.length;
  }

  console.log(count);
}
