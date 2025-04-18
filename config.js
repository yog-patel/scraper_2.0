/**
 * Configuration settings for the scraper
 */
module.exports = {
    // Browser settings
    browser: {
        headless: false,
        defaultViewport: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    
    // Scraper settings
    scraper: {
        waitTime: 2000, // Default wait time in milliseconds
        navigationOptions: { waitUntil: "networkidle2" }
    },
    
    // Target URLs
    urls: {
        baseUrl: "https://www.mvlempyr.com",
        defaultNovel: "https://www.mvlempyr.com/novel/the-villains-story"
    }
};