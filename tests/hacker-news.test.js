const { test, expect } = require("@playwright/test");
const { validateArticleSorting, CONFIG } = require("../index.js");

test.describe("Hacker News Article Validation", () => {
  test("validateArticleSorting passes for 100 sorted articles on /newest", async () => {
    const result = await validateArticleSorting({ HEADLESS: true });

    expect(result.success).toBe(true);
    expect(result.articles).toHaveLength(CONFIG.MAX_ARTICLES);
    expect(result.error).toBeUndefined();

    // Verify articles object
    expect(result.articles[0]).toHaveProperty("rank");
    expect(result.articles[0]).toHaveProperty("title");
    expect(result.articles[0]).toHaveProperty("timestamp");
    expect(result.articles[0]).toHaveProperty("url");

    // Verify articles data types
    expect(typeof result.articles[0].rank).toBe("number");
    expect(typeof result.articles[0].title).toBe("string");
    expect(typeof result.articles[0].timestamp).toBe("string");
  });

  test("validateArticleSorting fails for 100 articles from homepage", async () => {
    const result = await validateArticleSorting({
      URL: "https://news.ycombinator.com",
      HEADLESS: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Timestamp sort validation failed");
    expect(result.articles).toHaveLength(CONFIG.MAX_ARTICLES);
    expect(result.error).toBeDefined();
  });

  test("validateArticleSorting timesout for /newcomments page with no articles", async () => {
    const result = await validateArticleSorting({
      URL: "https://news.ycombinator.com/newcomments",
      HEADLESS: true,
    });

    expect(result.success).toBe(false);
    expect(result.articles).toBeUndefined();
    expect(result.error).toBeDefined();
  });
});
