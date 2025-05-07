
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteerExtra.use(StealthPlugin());

async function launchBrowser() {
  try {
    console.log("Launching browser...");
    
    const browser = await puppeteerExtra.launch({
      headless: "new", // Use the new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    console.log("Browser launched successfully");
    return browser;
  } catch (error) {
    console.error("Error launching browser:", error);
    throw error;
  }
}

module.exports = {
  launchBrowser
};