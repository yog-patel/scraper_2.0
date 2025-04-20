// // main.js
// const { launchBrowser } = require("./browser");
// const { scrapeNovelDetails, scrapeChapters } = require("./scraper");
// const { 
//   insertNovel, 
//   insertChapters, 
//   checkNovelExists,
//   getLatestChapterNumber,
//   closeDbConnection
// } = require("./DatabaseOperations");

// // Main execution function
// async function main() {
//     const url = "https://www.mvlempyr.com/novel/reawakening-sss-rank-villains-pov"; // Target URL
//     const browser = await launchBrowser();
//     const page = await browser.newPage();
    
//     try {
//         // Set up the page
//         await page.setUserAgent(
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//         );
//         await page.goto(url, { waitUntil: "networkidle2" });

//         // Scrape novel details
//         const novelData = await scrapeNovelDetails(page);
//         console.log("Novel information:", novelData);

//         if (!novelData.title || !novelData.author) {
//             console.log("Missing essential novel data (title or author). Exiting.");
//             return;
//         }

//         // Store novel in database or get existing ID
//         const novelId = await insertNovel({
//             title: novelData.title,
//             author: novelData.author,
//             description: novelData.synopsis,
//             cover_image_url: novelData.imageLink,
//             tags: novelData.tags,
//             genres: novelData.genres,
//             status: novelData.status,
//         });

//         if (!novelId) {
//             console.log("Failed to process novel data. Exiting.");
//             return;
//         }

//         // Get latest chapter from DB to determine how many chapters to scrape
//         const latestChapterNumber = await getLatestChapterNumber(novelId);
//         console.log(`Current chapters in database: ${latestChapterNumber}`);
//         console.log(`Total chapters on site: ${novelData.numOfCh}`);

//         if (latestChapterNumber >= novelData.numOfCh) {
//             console.log("Novel is already up to date. No new chapters to scrape.");
//             return;
//         }

//         // Calculate how many new chapters to scrape
//         const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
//         console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

//         // Scrape chapters (only the new ones)
//         // If no chapters exist, scrape all. Otherwise, scrape only new chapters
//         const scrapedChapters = await scrapeChapters(page, novelData.numOfCh, latestChapterNumber);
//         console.log(`Total new chapters scraped: ${scrapedChapters.length}`);

//         // Store new chapters in database
//         if (scrapedChapters.length > 0) {
//             const newChaptersCount = await insertChapters(novelId, scrapedChapters);
//             console.log(`${newChaptersCount} new chapters stored in database with Novel ID: ${novelId}`);
//         } else {
//             console.log("No new chapters to store.");
//         }

//     } catch (error) {
//         console.error("Error during scraping:", error);
//     } finally {
//         // Close browser when done
//         await browser.close();
//         // Close database connection
//         await closeDbConnection();
//         console.log("Scraping process completed");
//     }
// }

// // Execute the main function
// main().catch(console.error);

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
                console.log(`Current chapters in database: ${latestChapterNumber}`);
                console.log(`Total chapters on site: ${novelData.numOfCh}`);

                if (latestChapterNumber >= novelData.numOfCh) {
                    console.log("Novel is already up to date. No new chapters to scrape.");
                    continue;  // Skip this novel and move to the next one
                }

                // Calculate how many new chapters to scrape
                const chaptersToScrape = novelData.numOfCh - latestChapterNumber;
                console.log(`Need to scrape ${chaptersToScrape} new chapters.`);

                // Scrape chapters (only the new ones)
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
