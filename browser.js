const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Initialize puppeteer with stealth plugin
puppeteer.use(StealthPlugin());

/**
 * Launches a browser instance with specified configurations
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
async function launchBrowser() {
    return await puppeteer.launch({ 
        headless: false,
        defaultViewport: false
    });
}

module.exports = {
    launchBrowser
};