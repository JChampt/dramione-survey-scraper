# dramione-survey-scraper

## Overview

The Reddit Comment Scraper is a Node.js script that extracts comments from a Reddit thread using the snoowrap API wrapper. It focuses on extracting top-level comments and one layer of replies from a specified Reddit thread. 

## Getting Started


### Prerequisites

Before you begin, ensure you have the following dependencies and credentials in place:

- Node.js and npm installed on your system.
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
```
  git clone https://github.com/yourusername/dramione-survey-scraper.git
```

Install the required npm packages:
```
  npm install
```

### Usage

To run the Reddit Comment Scraper, you can specify the Reddit thread ID, depth of replies to retrieve, and request delay in milliseconds as arguments. By default, it uses the megaThread2023ID, a depth of 2 for comments, and a request delay of 400ms.

```
node dramione.js [threadID] [depth] [requestDelay]
```

For example, to scrape comments from a different Reddit thread with a depth of 3 and a request delay of 500ms:

```
node dramione.js 163lqu4 3 500
```

## Explanation & Resources

