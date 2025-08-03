# QA Wolf - Hacker News Article Validator

A Playwright-based solution for validating article sorting on Hacker News. It scrapes the [Hacker News /newest](https://news.ycombinator.com/newest) page and verifies that the first 100 articles are sorted from newest to oldest. The script is modular and can be easily adapted for other article pages with minimal modifications.

## Quick Start

### Install dependencies

```bash
npm install
```

### Run the main script

```bash
node index.js
```

Launches a browser window and displays the scraping process in real-time.

### Run the test suite

```bash
npm test
```

Runs headless tests across Chromium, Firefox, and WebKit for multiple pages.

### Open test report

```bash
npm run report
```

Opens the most recent test report in your default browser.

## Features

- **`index.js`** – Main scraping script with multi-browser support
- **`tests/hacker-news.test.js`** – Test suite covering success, failure, and error cases
- **Cross-browser validation** on Chromium, Firefox, and WebKit
- **Modular configuration** for URLs, browsers, and selectors

## Configuration

Modify the `CONFIG` object in `index.js`:

```javascript
const CONFIG = {
  BROWSER: "chromium", // Options: chromium, firefox, or webkit
  URL: "https://news.ycombinator.com/newest",
  MAX_ARTICLES: 100, // Max articles to scrape
  // ...
};
```

--------------------------------------------------------------------------------

_QA Wolf Take Home Assignment by Frank Rodriguez_
