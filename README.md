# dramione-survey-scraper

## Overview

This Reddit Comment Scraper is a Node.js script that extracts comments from a Reddit thread using the [snoowrap API wrapper](https://not-an-aardvark.github.io/snoowrap/index.html). It focuses on extracting top-level comments and one layer of replies from a specified Reddit thread.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following dependencies and credentials in place:

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your system.
- Reddit API credentials stored in an `OAuth.json` file. The format for the `OAuth.json` file is as follows:

```json
{
  "userAgent": "***",
  "clientId": "*************",
  "clientSecret": "***********",
  "username": "***",
  "password": "***"
}
```

**Note**: Make sure to keep the OAuth.json file secure and add it to your .gitignore to prevent accidental exposure of your credentials.

### Installation

Clone this repository to your local machine:

```bash
  git clone https://github.com/JChampt/dramione-survey-scraper.git
```

Install the required npm packages:

```bash
  npm install
```

### Usage

To run the Reddit Comment Scraper, you can specify the Reddit thread ID, depth of replies to retrieve, and request delay in milliseconds as arguments. By default, it uses the megaThread2023ID, a depth of 2 for comments, and a request delay of 400ms.

```bash
node dramione.js [threadID] [depth] [requestDelay]
```

For example, to scrape comments from a different Reddit thread with a depth of 3 and a request delay of 500ms:

```bash
node dramione.js 163lqu4 3 500
```

## Explanation & Resources

The majority of the time spent on this project was trying to figure out how to get all of the comment data from a Reddit thread.  The two main options were to either scrape the html or use Reddit's API.  Both options have their own hurdles.  For this project I ended up using the Reddit API.  

What I learned was that if you make a call via the api for the comments on a thread you don't get all of the comments.  You get some of the comments along with several 'more' lists with more comment IDs.  This made navigating the json data I was getting from the Reddit api really confusing (to me at least).  In the end I learned that you should use an API wrapper to handle all of the boilerplate code of dealing with Reddit's API.  

I ended up doing all of this in Javascript because that is what I am most comfortable, but you could ues python as well.  If you were to do this in python I would use [PRAW](https://praw.readthedocs.io/en/stable/).  

### Here are the resources I found to be really useful in setting all of this up

- [Reddit API Tutorial](https://youtu.be/x9boO9x3TDA?si=EDtX-PRCd2Xcal7P)
- [Using the Reddit API, Javascript and Snoowrap to Make an Automatic Link Poster](https://youtu.be/kDYSt4dSnIo?si=Ioo2vzGVSDrWMM1M)
- [snoowrap documentation](https://not-an-aardvark.github.io/snoowrap/index.html)
- [reddit api documentation](https://www.reddit.com/dev/api)
- [Reddit OAuth example](https://github.com/reddit-archive/reddit/wiki/OAuth2-Quick-Start-Example)
