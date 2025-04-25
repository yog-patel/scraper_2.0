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
        "https://www.mvlempyr.com/novel/absolutely-do-not-touch-eldmia-egga",
        "https://www.mvlempyr.com/novel/abyss-draconis",
        "https://www.mvlempyr.com/novel/abyss-of-dual-cultivation-goddesss-lust-system",
        "https://www.mvlempyr.com/novel/abyssal-awakening",
        "https://www.mvlempyr.com/novel/abyssal-chronicles",
        "https://www.mvlempyr.com/novel/abyssal-lord-of-the-magi-world",
        "https://www.mvlempyr.com/novel/abyssal-sovereign-the-demons-dominion",
        "https://www.mvlempyr.com/novel/academys-undercover-professor",
        "https://www.mvlempyr.com/novel/accompanying-the-phoenix",
        "https://www.mvlempyr.com/novel/ace-of-terrans",
        "https://www.mvlempyr.com/novel/adopting-and-raising-the-male-lead-and-the-villain",
        "https://www.mvlempyr.com/novel/adorable-treasured-fox-divine-doctor-mother-overturning-the-heavens",
        "https://www.mvlempyr.com/novel/advent-of-the-archmage",
        "https://www.mvlempyr.com/novel/advent-of-the-three-calamities",
        "https://www.mvlempyr.com/novel/adventurer-of-many-professions",
        "https://www.mvlempyr.com/novel/aether-beasts",
        "https://www.mvlempyr.com/novel/aether-chronicles-birth-of-a-legend",
        "https://www.mvlempyr.com/novel/aetheral-space",
        "https://www.mvlempyr.com/novel/aetheric-chronicles-reborn-as-an-extra",
        "https://www.mvlempyr.com/novel/affinity-chaos",
        "https://www.mvlempyr.com/novel/after-an-infinite-flow-player-retires",
        "https://www.mvlempyr.com/novel/after-breaking-up-my-ex-asked-me-to-win-her-back",
        "https://www.mvlempyr.com/novel/after-brushing-face-at-the-apocalypses-boss-for-363-days",
        "https://www.mvlempyr.com/novel/after-defying-the-villains-fate-for-nine-lifetimes-the-heroines-turn-mad",
        "https://www.mvlempyr.com/novel/after-descending-the-mountain-seven-big-brothers-spoil-me",
        "https://www.mvlempyr.com/novel/after-divorce-i-inherited-the-games-fortune",
        "https://www.mvlempyr.com/novel/after-divorcing-my-celebrity-wife-i-became-the-worlds-richest-person",
        "https://www.mvlempyr.com/novel/after-leaving-the-team-the-adventurer-ladies-regretted-it-deeply",
        "https://www.mvlempyr.com/novel/after-rebirth-i-rejected-the-rich-yandere-lady",
        "https://www.mvlempyr.com/novel/after-stealing-heros-mother-i-reincarnated-in-the-fantasy-world",
        "https://www.mvlempyr.com/novel/after-surviving-the-apocalypse-i-built-a-city-in-another-world",
        "https://www.mvlempyr.com/novel/after-the-divorce-i-could-hear-the-voice-of-the-future",
        "https://www.mvlempyr.com/novel/after-the-vicious-cannon-fodder-was-reborn",
        "https://www.mvlempyr.com/novel/after-transformation-mine-and-her-wild-fantasy",
        "https://www.mvlempyr.com/novel/after-transmigrating-as-a-tycoons-wife-my-thoughts-are-heard-by-the-whole-family",
        "https://www.mvlempyr.com/novel/after-transmigrating-into-a-short-lived-white-moonlight-had-a-he-with-the-villain",
        "https://www.mvlempyr.com/novel/after-using-cheats-i-became-the-strongest-beast-tamer",
        "https://www.mvlempyr.com/novel/against-heavens-will",
        "https://www.mvlempyr.com/novel/against-the-gods",
        "https://www.mvlempyr.com/novel/against-the-true-gods",
        "https://www.mvlempyr.com/novel/age-of-adepts",
        "https://www.mvlempyr.com/novel/ai-doctor-from-slave-to-beast-king",
        "https://www.mvlempyr.com/novel/akashic-records-of-the-bastard-child-engaged-to-a-goddess",
        "https://www.mvlempyr.com/novel/akuyaku-reijou-ni-nanka-narimasen-watashi-wa-futsuu-no-koushaku-reijou-desu",
        "https://www.mvlempyr.com/novel/akuyaku-reijou-wa-danna-sama-wo-yasesasetai",
        "https://www.mvlempyr.com/novel/alantina-online-the-greatest-sword-mage-reborn-as-a-weak-npc",
        "https://www.mvlempyr.com/novel/alchemist-in-the-apocalypse-rise-of-a-legend",
        "https://www.mvlempyr.com/novel/all-round-mid-laner",
        "https://www.mvlempyr.com/novel/all-rounder-artist",
        "https://www.mvlempyr.com/novel/all-the-heroines-are-my-ex-girlfriends",
        "https://www.mvlempyr.com/novel/allure-of-the-night",
        "https://www.mvlempyr.com/novel/almighty-father-system",
        "https://www.mvlempyr.com/novel/alpha-culinary-love",
        "https://www.mvlempyr.com/novel/alpha-instinct",
        "https://www.mvlempyr.com/novel/although-i-am-only-level-1-but-with-this-unique-skill-i-am-the-strongest",
        "https://www.mvlempyr.com/novel/altina-the-sword-princess",
        "https://www.mvlempyr.com/novel/am-i-a-crispy-college-student-the-whole-internet-says-that-im-hard-to-kill",
        "https://www.mvlempyr.com/novel/america-1919",
        "https://www.mvlempyr.com/novel/america-tycoon-the-wolf-of-showbiz",
        "https://www.mvlempyr.com/novel/american-exorcism-male-god",
        "https://www.mvlempyr.com/novel/american-tax-officer",
        "https://www.mvlempyr.com/novel/amon-the-legendary-overlord",
        "https://www.mvlempyr.com/novel/an-a-ranked-adventurers-slow-living",
        "https://www.mvlempyr.com/novel/an-extras-pov",
        "https://www.mvlempyr.com/novel/an-extras-rise-in-an-eroge",
        "https://www.mvlempyr.com/novel/an-otome-games-burikko-villainess-turned-into-a-magic-otaku",
        "https://www.mvlempyr.com/novel/an-owls-rise",
        "https://www.mvlempyr.com/novel/ancestral-lineage",
        "https://www.mvlempyr.com/novel/ancestral-wealth-inheritance-system",
        "https://www.mvlempyr.com/novel/ancient-dragon-elephant-technique",
        "https://www.mvlempyr.com/novel/ancient-godly-monarch",
        "https://www.mvlempyr.com/novel/ancient-strengthening-technique",
        "https://www.mvlempyr.com/novel/angel-monarch",
        "https://www.mvlempyr.com/novel/angry-harry-and-the-seven-by-sinyk",
        "https://www.mvlempyr.com/novel/ankoku-kishi-monogatari-yuusha-wo-taosu-tameni-maou-ni-shoukansaremashita",
        "https://www.mvlempyr.com/novel/another-world-mall",
        "https://www.mvlempyr.com/novel/antagonist-protection-service",
        "https://www.mvlempyr.com/novel/apocalypse---evil-shelter-system",
        "https://www.mvlempyr.com/novel/apocalypse-apparently-i-can-see-zombies",
        "https://www.mvlempyr.com/novel/apocalypse-baby",
        "https://www.mvlempyr.com/novel/apocalypse-chaos---i-am-the-villain",
        "https://www.mvlempyr.com/novel/apocalypse-cheater",
        "https://www.mvlempyr.com/novel/apocalypse-descent-farming-with-my-harem",
        "https://www.mvlempyr.com/novel/apocalypse-healer---path-of-death",
        "https://www.mvlempyr.com/novel/apocalypse-i-can-see-the-hp-bar-killing-monsters-drops-loot",
        "https://www.mvlempyr.com/novel/apocalypse-infinite-evolution-starts-from-attribute-allocation",
        "https://www.mvlempyr.com/novel/apocalypse-king-of-zombies",
        "https://www.mvlempyr.com/novel/apocalypse-rebirth-beauties-surround-me",
        "https://www.mvlempyr.com/novel/apocalypse-reset-my-crab-can-heal-the-world",
        "https://www.mvlempyr.com/novel/apocalyptic-disasters-carrying-a-bun-and-hoarding-supplies",
        "https://www.mvlempyr.com/novel/apocalyptic-reincarnation-start-with-a-30-million-bonus",
        "https://www.mvlempyr.com/novel/apotheosis-of-a-demon---a-monster-evolution-story",
        "https://www.mvlempyr.com/novel/arafoo-kenja-no-isekai-seikatsu-nikki",
        "https://www.mvlempyr.com/novel/archean-eon-art",
        "https://www.mvlempyr.com/novel/arena",
        "https://www.mvlempyr.com/novel/arifureta-shokugyou-de-sekai-saikyou-wn",
        "https://www.mvlempyr.com/novel/ark",
        "https://www.mvlempyr.com/novel/arkendrithyst",
        "https://www.mvlempyr.com/novel/armipotent",
        "https://www.mvlempyr.com/novel/as-a-father-i-just-want-to-quietly-watch-you-live-a-long-life",
        "https://www.mvlempyr.com/novel/ascendance-of-a-bookworm",
        "https://www.mvlempyr.com/novel/ascending-do-not-disturb",
        "https://www.mvlempyr.com/novel/ascension-of-chaos",
        "https://www.mvlempyr.com/novel/ascension-of-the-dark-seraph",
        "https://www.mvlempyr.com/novel/ascension-of-the-immortal-asura",
        "https://www.mvlempyr.com/novel/ascension-of-the-monster-queen",
        "https://www.mvlempyr.com/novel/ascension-of-the-unholy-immortal",
        "https://www.mvlempyr.com/novel/ascension-of-the-villain",
        "https://www.mvlempyr.com/novel/ascension-through-skills",
        "https://www.mvlempyr.com/novel/ashen-dragon",
        "https://www.mvlempyr.com/novel/asked-you-to-write-a-book-not-to-confess-your-criminal-record",
        "https://www.mvlempyr.com/novel/assassin-at-range-the-snipers-lethal-power",
        "https://www.mvlempyr.com/novel/assassin-farmer",
        "https://www.mvlempyr.com/novel/assimilate-all-talents",
        "https://www.mvlempyr.com/novel/asuka-of-the-scarlet-sky",
        "https://www.mvlempyr.com/novel/asura-mad-emperor",
        "https://www.mvlempyr.com/novel/at-the-northern-fort",
        "https://www.mvlempyr.com/novel/at-the-start-i-tricked-the-school-beauty-and-ended-up-with-twins",
        "https://www.mvlempyr.com/novel/atelier-tanaka",
        "https://www.mvlempyr.com/novel/attaining-immortality-starting-from-slaying-demons",
        "https://www.mvlempyr.com/novel/atticuss-odyssey-reincarnated-into-a-playground",
        "https://www.mvlempyr.com/novel/attribute-farming-system",
        "https://www.mvlempyr.com/novel/awakened-sss-ranked-soul-king",
        "https://www.mvlempyr.com/novel/awakened-talent-10-000-exp-converter",
        "https://www.mvlempyr.com/novel/awakened-the-spirit-king",
        "https://www.mvlempyr.com/novel/awakening",
        "https://www.mvlempyr.com/novel/awakening-reincarnating-with-the-sss-level-extraction-talent",
        "https://www.mvlempyr.com/novel/awakening-the-daily-intelligence-system",
        "https://www.mvlempyr.com/novel/awakening-the-infinite-evolution-of-my-talent-as-a-low-level-awakener",
        "https://www.mvlempyr.com/novel/aztec-civilization-destiny-to-conquer-america",
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
