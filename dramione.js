const snoowrap = require('snoowrap');
const fs = require('fs');

// const megaThread2022ID = 'x60ake';
const megaThread2023ID = '163lqu4';
const replyDepth = 2; // We only need top-level comments and one layer of replies for this project.  Depth 2 gets us that.
const minimumSafeRequestDelay = 400; // 400 ms delay between requests.  Reddit gets angry if you make too many requests.  400 usually works, can use higher if need be though.

run();

// Extracting every comment on a thread using API wrapper snoowrap
function run(
  threadID = megaThread2023ID,
  depth = replyDepth,
  requestDelay = minimumSafeRequestDelay
) {
  const OAuth = fs.readFileSync('./OAuth.json', 'utf8');
  /*
  Oauth object gets passed to the snoowrap object during initialization.  Here is the shape: 
    {
      "userAgent": "***",
      "clientId": "*************",
      "clientSecret": "***********",
      "username": "***",
      "password": "***"
    }
  Oauth contains user login details, so it needs to kept in a seperate gitignored file.  See Readme for details. 
*/
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

    csvOut.push(` ,${category},${category},,${topLevelComment.ups}`);
    csvOut.push(...iterateReplies(category, topLevelComment.replies));
    csvOut.push('');
  }

  return csvOut.join('\n');
}

function getCategory(topLevelComment) {
  const category = removeProblemCharacters(topLevelComment.body);

  return category.startsWith('CATEGORY: Best New Author (published their first')
    ? 'CATEGORY: Best New Author'
    : category;
}

function iterateReplies(category, replies) {
  const res = [];

  for (let i = 0; i < replies.length; i++) {
    const reply = replies[i];
    const parsedBody = extractInfoWithRegex(reply.body);

    res.push(`${category},${parsedBody},${reply.ups}`);
  }

  return res;
}

function extractInfoWithRegex(commentBody) {
  const text = removeProblemCharacters(commentBody);

  // checking for removed comments
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

  // This tags any line that the regex wasn't able to parse with 'FixMe' and pastes the whole body after that for manual cleanup
  if (output.includes('FixMe'))
    return `FixMe,${text.replace(/[\r\n]+/gm, ' ')},`;

  return output;
}

// some characters cause issues either with the csv file or the regex I am using to parse the comment bodies
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
