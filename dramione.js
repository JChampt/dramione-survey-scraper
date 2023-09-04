// First you need to manually expand all of the comments on the page so they are all loaded in the browser.
// Then this will grab the node list and store it in a variable
// NOTE: This selector only works in Chrome!!
// let selected = document.querySelectorAll('shreddit-comment');

// creates a link at the bottom of the page to save whatever content you pass to it to file.
function saveToFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.textContent = 'Download ' + fileName;

  document.body.appendChild(a);
}

// Extracting every comment on a thread using API wrapper snoowrap
// r.getSubmission('4j8p6d').expandReplies({limit: Infinity, depth: Infinity}).then(console.log)

const snoowrap = require('snoowrap');

// Create a new snoowrap requester with OAuth credentials.
// For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
const r = new snoowrap({
  userAgent: 'put your user-agent string here',
  clientId: 'put your client id here',
  clientSecret: 'put your client secret here',
  refreshToken: 'put your refresh token here',
});

r.getSubmission('163lqu4')
  .expandReplies({ limit: Infinity, depth: Infinity })
  .then(console.log);
