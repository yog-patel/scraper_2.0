// main.js
const { launchBrowser } = require("./browser");
const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
const { 
  insertNovel, 
  insertChapters, 
  checkNovelExists,
  getLatestChapterNumber,
  closeDbConnection
} = require("./DatabaseOperations");

// Main execution function
async function main() {
    const url = "https://www.mvlempyr.com/novel/reawakening-sss-rank-villains-pov"; // Target URL
    const browser = await launchBrowser();
    const page = await browser.newPage();
    
    try {
        // Set up the page
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
        await page.goto(url, { waitUntil: "networkidle2" });

        // Scrape novel details
        const novelData = await scrapeNovelDetails(page);
        console.log("Novel information:", novelData);

        if (!novelData.title || !novelData.author) {
            console.log("Missing essential novel data (title or author). Exiting.");
            return;
        }

        // Store novel in database or get existing ID
        const novelId = await insertNovel({
            title: novelData.title,
            author: novelData.author,
            description: novelData.synopsis,
            cover_image_url: novelData.imageLink,
            tags: novelData.tags,
            genres: novelData.genres,
            status: novelData.status,
        });

        if (!novelId) {
            console.log("Failed to process novel data. Exiting.");
            return;
        }

        // Get latest chapter from DB to determine how many chapters to scrape
        const latestChapterNumber = await getLatestChapterNumber(novelId);
        console.log(`Current chapters in database: ${latestChapterNumber}`);
        console.log(`Total chapters on site: ${novelData.numOfCh}`);

        if (latestChapterNumber >= novelData.numOfCh) {
            console.log("Novel is already up to date. No new chapters to scrape.");
            return;
        }

        // Calculate how many new chapters to scrape
        const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
        console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

        // Scrape chapters (only the new ones)
        // If no chapters exist, scrape all. Otherwise, scrape only new chapters
        const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
        console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

        // Store new chapters in database
        if (scrapedChapters.length > 0) {
            const newChaptersCount = await insertChapters(novelId, scrapedChapters);
            console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
        } else {
            console.log("No new chapters to store.");
        }

    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        // Close browser when done
        await browser.close();
        // Close database connection
        await closeDbConnection();
        console.log("Scraping process completed");
    }
}

// Execute the main function
main().catch(console.error);