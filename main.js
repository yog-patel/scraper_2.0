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

    const urls = [
        "https://www.mvlempyr.com/novel/shattered-innocence-transmigrated-into-a-novel-as-an-extra",
        "https://www.mvlempyr.com/novel/extra-s-death-i-am-the-son-of-hades",
        "https://www.mvlempyr.com/novel/transmigrating-as-an-extra-third-rate-villain",
        "https://www.mvlempyr.com/novel/my-beautiful-disciples-i-m-really-not-the-main-character",
        "https://www.mvlempyr.com/novel/sss-rank-mother-in-law-to-an-invincible-family",
        "https://www.mvlempyr.com/novel/terra-nova-online-rise-of-the-strongest-player",
        "https://www.mvlempyr.com/novel/having-children-earns-benefit-start-competing-for-dominance-in-the-world-by-marrying-a-wife",
        "https://www.mvlempyr.com/novel/i-can-only-cultivate-in-a-game",
        "https://www.mvlempyr.com/novel/weapon-system-in-zombie-apocalypse",
        "https://www.mvlempyr.com/novel/strongest-kingdom-my-op-kingdom-got-transported-along-with-me",
        "https://www.mvlempyr.com/novel/a-farmer-s-journey-to-immortality",
        "https://www.mvlempyr.com/novel/bitcoin-billionaire-i-regressed-to-invest-in-the-first-bitcoin",
        "https://www.mvlempyr.com/novel/creation-of-all-things",
        "https://www.mvlempyr.com/novel/the-last-experience-point",
        "https://www.mvlempyr.com/novel/insect-tamer-s-ascension",
        "https://www.mvlempyr.com/novel/supreme-warlock-system-from-zero-to-ultimate-with-my-wives",
        "https://www.mvlempyr.com/novel/the-redwood-saga",
        "https://www.mvlempyr.com/novel/starting-with-an-sss-rank-swordsmanship-talent",
        "https://www.mvlempyr.com/novel/follow-the-path-of-dao-from-infancy",
        "https://www.mvlempyr.com/novel/reborn-as-the-genius-son-of-the-richest-family",
        "https://www.mvlempyr.com/novel/parasite-gu-breeding-longveity-path-starting-from-the-love-enamored-gu",
        "https://www.mvlempyr.com/novel/lackey-s-seducing-survival-odyssey",
        "https://www.mvlempyr.com/novel/dashing-student",
        "https://www.mvlempyr.com/novel/shadow-slave",
        "https://www.mvlempyr.com/novel/reincarnated-as-the-third-son-of-the-duke",
        "https://www.mvlempyr.com/novel/major-league-system",
        "https://www.mvlempyr.com/novel/the-conquerors-path",
        "https://www.mvlempyr.com/novel/the-fairies-i-flirted-with-in-the-game-became-real",
        "https://www.mvlempyr.com/novel/the-last-paragon-in-the-apocalypse",
        "https://www.mvlempyr.com/novel/the-world-conquest-giving-birth-to-become-a-god",
        "https://www.mvlempyr.com/novel/global-lord-100-drop-rate",
        "https://www.mvlempyr.com/novel/i-have-a-disciple-simulator",
        "https://www.mvlempyr.com/novel/in-the-supreme-fantasy-world-back-in-time-and-do-whatever-you-want",
        "https://www.mvlempyr.com/novel/global-lords-hundredfold-increments-starting-with-the-undead",
        "https://www.mvlempyr.com/novel/i-truly-am-the-villian",
        "https://www.mvlempyr.com/novel/my-love-debts-are-everywhere",
        "https://www.mvlempyr.com/novel/my-enchanting-system",
        "https://www.mvlempyr.com/novel/dimensional-descent",
        "https://www.mvlempyr.com/novel/grand-lust-sovereign",
        "https://www.mvlempyr.com/novel/kingdom-building-game-starting-out-with-a-million-upgrade-points",
        "https://www.mvlempyr.com/novel/natural-disaster-i-started-by-hoarding-tens-of-billions-of-supplies",
        "https://www.mvlempyr.com/novel/assassin-farmer",
        "https://www.mvlempyr.com/novel/inside-an-adult-game-as-a-former-hero",
        "https://www.mvlempyr.com/novel/extra-s-descent",
        "https://www.mvlempyr.com/novel/villain-the-play-of-destiny",
        "https://www.mvlempyr.com/novel/fog",
        "https://www.mvlempyr.com/novel/poison-god-s-heritage",
        "https://www.mvlempyr.com/novel/runemaster-in-the-last-days",
        "https://www.mvlempyr.com/novel/necromancer-of-the-shadows",
        "https://www.mvlempyr.com/novel/guide-to-raising-the-sick-villain",
        "https://www.mvlempyr.com/novel/reawakening-sss-rank-villains-pov",
        "https://www.mvlempyr.com/novel/extras-death-i-am-the-son-of-hades",
        "https://www.mvlempyr.com/novel/struggling-as-a-villain",
        "https://www.mvlempyr.com/novel/third-rebirth-godsfall-apocalypse",
        "https://www.mvlempyr.com/novel/i-was-mistaken-for-the-reincarnated-evil-overlord",
        "https://www.mvlempyr.com/novel/worldcrafter---building-my-underground-kingdom",
        "https://www.mvlempyr.com/novel/daily-life-of-a-cultivation-judge",
        "https://www.mvlempyr.com/novel/antagonist-protection-service",
        "https://www.mvlempyr.com/novel/extra-to-protagonist",
        "https://www.mvlempyr.com/novel/reincarnated-as-an-elf-prince",
        "https://www.mvlempyr.com/novel/my-talents-name-is-generator",
        "https://www.mvlempyr.com/novel/becoming-the-strongest-as-a-game-dev",
        "https://www.mvlempyr.com/novel/evolution-of-the-ruined-heir",
        "https://www.mvlempyr.com/novel/ascension-of-the-dark-seraph",
        "https://www.mvlempyr.com/novel/zombie-apocalypse-reborn-with-a-farming-space",
        "https://www.mvlempyr.com/novel/the-glitched-mage",
        "https://www.mvlempyr.com/novel/strongest-demigod-system",
        "https://www.mvlempyr.com/novel/magus-supremacy",
        "https://www.mvlempyr.com/novel/how-to-survive-in-the-roanoke-colony",
        "https://www.mvlempyr.com/novel/godly-revival-system-i-buy-my-killers-stats",
        "https://www.mvlempyr.com/novel/rebirth-slice-of-life-cultivation",
        "https://www.mvlempyr.com/novel/i-accidentally-became-a-superstar",
        "https://www.mvlempyr.com/novel/the-abyssal-garden-no-room-for-the-idle",
        "https://www.mvlempyr.com/novel/from-abyssal-invasion-to-bursting-stars-with-a-single-sword",
        "https://www.mvlempyr.com/novel/ex-rank-talent-awakening-100-dodge-rate",
        "https://www.mvlempyr.com/novel/multiversal-livestreaming-system-i-can-copy-my-viewers-skills",
        "https://www.mvlempyr.com/novel/the-villains-pov",
        "https://www.mvlempyr.com/novel/i-slaughtered-through-the-dungeon-worlds-with-my-cheats",
        "https://www.mvlempyr.com/novel/wizard-i-can-refine-everything",
        "https://www.mvlempyr.com/novel/i-become-a-martial-arts-god-in-the-chaotic-demon-world",
        "https://www.mvlempyr.com/novel/1-lifesteal",
        "https://www.mvlempyr.com/novel/10-nen-goshi-no-hikiniito-o-yamete-gaishutsushitara-jitaku-goto-isekai-ni-tenishiteta",
        "https://www.mvlempyr.com/novel/100-000-hour-professional-stand-in",
        "https://www.mvlempyr.com/novel/100-days-to-seduce-the-devil",
        "https://www.mvlempyr.com/novel/108-maidens-of-destiny",
        "https://www.mvlempyr.com/novel/10x-cashback-your-wealth-is-mine",
        "https://www.mvlempyr.com/novel/21st-century-necromancer",
        "https://www.mvlempyr.com/novel/48-hours-a-day",
        "https://www.mvlempyr.com/novel/500th-time-reborn-a-world-only-known-by-women-the-karma-system",
        "https://www.mvlempyr.com/novel/a-certain-middle-aged-mans-vrmmo-activity-log",
        "https://www.mvlempyr.com/novel/a-crowd-of-evil-spirit-lines-up-to-confess-to-me",
        "https://www.mvlempyr.com/novel/a-demon-lords-tale-dungeons-monster-girls-and-heartwarming-bliss",
        "https://www.mvlempyr.com/novel/a-fairy-tales-for-the-villains",
        "https://www.mvlempyr.com/novel/a-farmers-journey-to-immortality",
        "https://www.mvlempyr.com/novel/a-filthy-rich-hamster-in-the-apocalypse",
        "https://www.mvlempyr.com/novel/a-gunslingers-system-in-a-world-of-magic",
        "https://www.mvlempyr.com/novel/a-journey-of-black-and-red",
        "https://www.mvlempyr.com/novel/a-journey-that-changed-the-world",
        "https://www.mvlempyr.com/novel/a-knight-who-eternally-regresses",
        "https://www.mvlempyr.com/novel/a-mistaken-marriage-match-a-generation-of-military-counselor",
        "https://www.mvlempyr.com/novel/a-mistaken-marriage-match-record-of-washed-grievances",
        "https://www.mvlempyr.com/novel/a-monster-who-levels-up",
        "https://www.mvlempyr.com/novel/a-new-india",
        "https://www.mvlempyr.com/novel/a-new-world-an-immersive-game-experience",
        "https://www.mvlempyr.com/novel/a-novel-concept---a-death-a-day-mc-will-live-anyway",
        "https://www.mvlempyr.com/novel/a-painting-of-the-villainess-as-a-young-lady",
        "https://www.mvlempyr.com/novel/a-peacock-husband-of-five-princesses-by-day-a-noble-assassin-by-night",
        "https://www.mvlempyr.com/novel/a-perverts-world",
        "https://www.mvlempyr.com/novel/a-practical-guide-to-sorcery",
        "https://www.mvlempyr.com/novel/a-rare-magical-miracle-in-the-world",
        "https://www.mvlempyr.com/novel/a-record-of-a-mortals-journey-to-immortality",
        "https://www.mvlempyr.com/novel/a-regressed-villain-heroines-villainesses-and-me",
        "https://www.mvlempyr.com/novel/a-regressors-tale-of-cultivation",
        "https://www.mvlempyr.com/novel/a-saint-who-was-adopted-by-the-grand-duke",
        "https://www.mvlempyr.com/novel/a-slave-to-my-vengeful-lover",
        "https://www.mvlempyr.com/novel/a-slight-smile-is-very-charming",
        "https://www.mvlempyr.com/novel/a-soldiers-life",
        "https://www.mvlempyr.com/novel/a-time-of-tigers---from-peasant-to-emperor",
        "https://www.mvlempyr.com/novel/a-transmigrators-privilege",
        "https://www.mvlempyr.com/novel/a-villainess-for-the-tyrant",
        "https://www.mvlempyr.com/novel/a-villains-way-of-taming-heroines",
        "https://www.mvlempyr.com/novel/a-vip-as-soon-as-you-log-in",
        "https://www.mvlempyr.com/novel/a-wild-last-boss-appeared",
        "https://www.mvlempyr.com/novel/a-will-eternal",
        "https://www.mvlempyr.com/novel/a-wolfs-howl-a-fairys-wing",
        "https://www.mvlempyr.com/novel/absolute-cheater",
        "https://www.mvlempyr.com/novel/absolute-choice",
        "https://www.mvlempyr.com/novel/absolute-death-game",
        "https://www.mvlempyr.com/novel/absolute-depravity-reincarnated-with-a-lustful-system",
        "https://www.mvlempyr.com/novel/absolute-regression",
      ];

    const browser = await launchBrowser();

    try {
        for (let url of urls) {
            console.log(`Scraping novel from URL: ${url}`);
            const page = await browser.newPage();

            try {
                // Set up the page
                await page.setUserAgent(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                );
                await page.goto(url, { waitUntil: "networkidle2" });

                // // Scrape novel details
                // const novelData = await scrapeNovelDetails(page);
                // console.log("Novel information:", novelData);

                // if (!novelData.title || !novelData.author) {
                //     console.log("Missing essential novel data (title or author). Exiting.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Store novel in database or get existing ID
                // const novelId = await insertNovel({
                //     title: novelData.title,
                //     author: novelData.author,
                //     description: novelData.synopsis,
                //     cover_image_url: novelData.imageLink,
                //     tags: novelData.tags,
                //     genres: novelData.genres,
                //     status: novelData.status,
                // });

                // if (!novelId) {
                //     console.log("Failed to process novel data. Skipping.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Get latest chapter from DB to determine how many chapters to scrape
                // const latestChapterNumber = await getLatestChapterNumber(novelId);
                // console.log(`Current chapters in database: ${latestChapterNumber}`);
                // console.log(`Total chapters on site: ${novelData.numOfCh}`);

                // if (latestChapterNumber >= novelData.numOfCh) {
                //     console.log("Novel is already up to date. No new chapters to scrape.");
                //     continue;  // Skip this novel and move to the next one
                // }

                // // Calculate how many new chapters to scrape
                // const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
                // console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

                // // Scrape chapters (only the new ones)
                // const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
                // console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Scrape novel details
        const novelData = await scrapeNovelDetails(page);
        console.log("Novel information:", novelData);

        if (!novelData.title || !novelData.author) {
            console.log("Missing essential novel data (title or author). Exiting.");
            continue;  // Skip this novel and move to the next one
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
            console.log("Failed to process novel data. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Get latest chapter from DB to determine how many chapters to scrape
        const latestChapterNumber = await getLatestChapterNumber(novelId);
        
        // Use the most reliable chapter count - prefer numOfCh but fall back to chapters
        // if numOfCh is zero
        const totalChapters = novelData.numOfCh || parseInt(novelData.chapters) || 0;
        
        console.log(`Current chapters in database: ${latestChapterNumber}`);
        console.log(`Total chapters on site: ${totalChapters}`);

        if (latestChapterNumber >= totalChapters || totalChapters === 0) {
            console.log("Novel is already up to date or no chapters found. Skipping.");
            continue;  // Skip this novel and move to the next one
        }

        // Calculate how many new chapters to scrape
        const chaptersToScrape = totalChapters - latestChapterNumber;
        console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

        // Scrape chapters (only the new ones)
        const scrapedChapters = await scrapeChapters(page, totalChapters, latestChapterNumber);
        console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

                // Store new chapters in database
                if (scrapedChapters.length > 0) {
                    const newChaptersCount = await insertChapters(novelId, scrapedChapters);
                    console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
                } else {
                    console.log("No new chapters to store.");
                }

            } catch (error) {
                console.error(`Error during scraping URL: ${url}`, error);
            } finally {
                // Close the page after scraping
                await page.close();
            }
        }

    } catch (error) {
        console.error("Error during scraping process:", error);
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
