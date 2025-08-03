const { chromium } = require("playwright");

// Config for Hacker News page and selectors to scrape
const CONFIG = {
  URL: "https://news.ycombinator.com/newest",
  MAX_ARTICLES: 100,
  HEADLESS: false,
  TIMEOUT: 10000, // (ms)
  SELECTORS: {
    ARTICLE_ROW: "tr.athing.submission",
    RANK: "span.rank",
    TITLE_LINK: "span.titleline a",
    TIMESTAMP: "span.age",
    NEXT_PAGE: "a.morelink",
  },
};

// Extract article data from each html table row
async function extractArticleData(row, selectors) {
  try {
    const rankElement = await row.$(selectors.RANK);
    const rank = parseInt((await rankElement.textContent()).replace(".", ""));

    const titleElement = await row.$(selectors.TITLE_LINK);
    const title = await titleElement.textContent();

    const subtextRow = await row.evaluateHandle((el) => el.nextElementSibling);
    const timestampElement = await subtextRow.$(selectors.TIMESTAMP);
    const timestamp = await timestampElement.getAttribute("title");

    const url = await titleElement.getAttribute("href");

    return { rank, title, timestamp, url };
  } catch (error) {
    console.warn(`Failed to extract article: ${error.message}`);
    return null;
  }
}

// Main function to scrape and validate article sorting
async function validateArticleSorting(options = {}) {
  const config = { ...CONFIG, ...options };
  const browser = await chromium.launch({ headless: config.HEADLESS });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to: ${config.URL}`);
    await page.goto(config.URL);

    const articles = [];

    // Loop through articles across multiple pages
    while (articles.length < config.MAX_ARTICLES) {
      console.log(
        `Scraping... (${articles.length}/${config.MAX_ARTICLES} articles)`
      );

      // Wait for article rows to load
      await page.waitForSelector(config.SELECTORS.ARTICLE_ROW, {
        timeout: config.TIMEOUT,
      });
      const articleRows = await page.$$(config.SELECTORS.ARTICLE_ROW);

      // Loop through each article on the
      for (const row of articleRows) {
        // Stop if we reach MAX_ARTICLES early
        if (articles.length >= config.MAX_ARTICLES) break;

        // Extract article data from each row
        const articleData = await extractArticleData(row, config.SELECTORS);

        // Add article data to articles array
        if (articleData) articles.push(articleData);
      }

      // Go to next page if we haven't reached MAX_ARTICLES
      if (articles.length < config.MAX_ARTICLES) {
        const moreLink = await page.$(config.SELECTORS.NEXT_PAGE);
        if (!moreLink) break; // Stop if a next page doesn't exist
        await moreLink.click();
        await page.waitForLoadState("networkidle");
      }
    }

    console.log(`Collected ${articles.length} articles\n`);

    // Validate article count
    if (articles.length !== config.MAX_ARTICLES) {
      return {
        success: false,
        articles,
        error: `Incorrect article count, expected ${config.MAX_ARTICLES} got ${articles.length}`,
      };
    }

    // Validate articles are sorted newest to oldest using epoch timestamps
    for (let i = 0; i < articles.length - 1; i++) {
      // Split hybrid timestamp and only use epoch portion
      const currentTime = parseInt(articles[i].timestamp.split(" ")[1]);
      const nextTime = parseInt(articles[i + 1].timestamp.split(" ")[1]);

      if (currentTime < nextTime) {
        return {
          success: false,
          articles,
          error: `Timestamp sort validation failed at article ${i + 1}`,
        };
      }
    }

    console.log("Sort and count validations passed");
    return {
      success: true,
      articles,
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

module.exports = { validateArticleSorting, CONFIG };

if (require.main === module) {
  (async () => {
    console.log("QA Wolf Take Home Assignment - Frank Rodriguez");
    console.log("----------------------------------------------\n");

    const result = await validateArticleSorting();

    if (!result.success) {
      console.log(`FAILED: ${result.error}`);
    }

    // Uncomment to display articles object in table format
    //console.table(result.articles);

    process.exit(result.success ? 0 : 1);
  })();
}
