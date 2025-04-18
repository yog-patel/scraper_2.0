// const puppeteer = require("puppeteer");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// // Initialize puppeteer with stealth plugin
// puppeteer.use(StealthPlugin());

// /**
//  * Launches a browser instance with specified configurations
//  * @returns {Promise<Browser>} Puppeteer browser instance
//  */
// async function launchBrowser() {
//     return await puppeteer.launch({ 
//         headless: false,
//         defaultViewport: false
//     });
// }
const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteerExtra.use(StealthPlugin());

async function launchBrowser() {
  const browser = await puppeteerExtra.launch({
    headless: false,
    executablePath: puppeteer.executablePath(), // this ensures Chromium is found
  });
  return browser;
}

module.exports = {
    launchBrowser
};