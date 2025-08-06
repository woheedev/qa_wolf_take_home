const { test, expect } = require("@playwright/test");
const { validateArticleSorting, CONFIG } = require("../index.js");

test.describe("Hacker News Article Validation", () => {
  test("newest page returns 100 sorted articles", async () => {
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

    // Verify sorting order
    const firstTimestamp = parseInt(result.articles[0].timestamp.split(" ")[1]);
    const lastTimestamp = parseInt(
      result.articles[CONFIG.MAX_ARTICLES - 1].timestamp.split(" ")[1]
    );
    expect(firstTimestamp).toBeGreaterThanOrEqual(lastTimestamp);
  });

  test("homepage fails sorting but returns articles", async () => {
    const result = await validateArticleSorting({
      URL: "https://news.ycombinator.com",
      HEADLESS: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Timestamp sort validation failed");
    expect(result.articles).toHaveLength(CONFIG.MAX_ARTICLES);
    expect(result.error).toBeDefined();

    // Verify we still got valid article data
    expect(result.articles[0]).toHaveProperty("rank");
    expect(result.articles[0]).toHaveProperty("timestamp");
  });

  test("newcomments page times out with no articles", async () => {
    const result = await validateArticleSorting({
      URL: "https://news.ycombinator.com/newcomments",
      HEADLESS: true,
    });

    expect(result.success).toBe(false);
    expect(result.articles).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/timeout|selector/i);
  });

  test("single article passes validation", async () => {
    const result = await validateArticleSorting({
      MAX_ARTICLES: 1,
      HEADLESS: true,
    });

    expect(result.success).toBe(true);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].rank).toBe(1);
  });

  test("ranks are sequential", async () => {
    const result = await validateArticleSorting({
      MAX_ARTICLES: 30,
      HEADLESS: true,
    });

    expect(result.success).toBe(true);

    result.articles.forEach((article, index) => {
      expect(article.rank).toBe(index + 1);
    });
  });

  test("articles have valid urls", async () => {
    const result = await validateArticleSorting({
      MAX_ARTICLES: 20,
      HEADLESS: true,
    });

    expect(result.success).toBe(true);

    result.articles.forEach((article) => {
      expect(article.url).toBeDefined();
      expect(typeof article.url).toBe("string");
      expect(article.url.length).toBeGreaterThan(0);
    });
  });
});
