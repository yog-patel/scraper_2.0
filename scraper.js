/**
 * Extracts novel details from the page
 * @param {Page} page - Puppeteer page instance
 * @returns {Promise<Object>} Novel details
 */
async function scrapeNovelDetails(page) {
  // Extract basic book details
  const bookInfo = await page.evaluate(() => {
      return {
          title: document.querySelector("title")?.innerText.split("|")[0].trim(),
          url: document.querySelector('link[rel="canonical"]')?.href,
      };
  });

  // Extract structured book info
  const newBookInfo = await page.evaluate(() => {
      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) {
          return JSON.parse(scriptTag.innerText);
      }
      return null;
  });

  // Extract book tags, synopsis, status
  const tagsAndGenres = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".collection-item-4 a")).map(tag => tag.innerText.trim());
  });

  // Separate genres and tags
  const genres = [];
  const tags = [];
  
  for (const item of tagsAndGenres) {
      // Skip items that start with '#\n'
      if (item.includes('#\\n')) {
          continue;
      }
      // If the item starts with '#', it's a tag
      else if (item.startsWith('#')) {
          // Clean the tag by removing '#' character
          const cleanTag = item.replace(/#/g, '').trim();
          tags.push(cleanTag);
      } else {
          genres.push(item);
      }
  }

  const synopsis = await page.evaluate(() => {
      const synopsisElement = document.querySelector(".synopsissection .synopsis");
      return synopsisElement ? synopsisElement.innerText.trim() : "No synopsis found";
  });

  const status = await page.evaluate(() => {
      const statusElement = document.querySelector("novelstatustextlarge");
      return statusElement ? statusElement.innerText.trim() : "Ongoing";
  });

  // Extract book image and chapter count
  const imageLink = await page.evaluate(() => {
      return document.querySelector("img.novel-image").src;
  });

  const numOfCh = await page.evaluate(() => {
    //   const num = document.getElementById("chapter-count");
    //   return num ? parseInt(num.innerText.trim()) : 0;
    let el = document.getElementById("chapter-count");
    if (!el) {
        el = document.getElementById("chapter-count2");
    }
    if (el) {
        const text = el.innerText.trim();
        const parsed = parseInt(text);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  // Combine all info
  return {
      title: bookInfo.title,
      author: newBookInfo?.author,
      chapters: newBookInfo?.numberOfChapters,
      numOfCh: numOfCh,
      status: status,
      coverImage: newBookInfo?.image,
      imageLink: imageLink,
      tags: tags,
      genres: genres,
      synopsis: synopsis,
  };
}

/**
* Navigate to the chapters list and click on specific chapter
* @param {Page} page - Puppeteer page instance
* @param {number} startFromChapter - Chapter number to start from (0 for first chapter)
*/
async function navigateToChapter(page, startFromChapter = 0) {
  // Scroll to the button and wait
  await page.evaluate(() => {
      const button = document.getElementById("chapter-listing");
      if (button) {
          button.scrollIntoView({ behavior: "smooth", block: "center" });
      }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Click the chapter-listing button after scrolling
  await page.evaluate(() => {
      document.getElementById("chapter-listing").click();
  });

  console.log("Clicked on 'Chapters' button successfully.");
  
  // If startFromChapter is 0, click the first chapter
  // Otherwise, click the chapter at position startFromChapter
  await page.evaluate((startFromChapter) => {
      const chapterItems = document.querySelectorAll(".chapter-item h3");
      const targetIndex = startFromChapter > 0 ? startFromChapter : 0;
      
      if (chapterItems.length > targetIndex) {
          chapterItems[targetIndex].scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
          console.log(`Chapter at index ${targetIndex} not found. Defaulting to first chapter.`);
          if (chapterItems.length > 0) {
              chapterItems[0].scrollIntoView({ behavior: "smooth", block: "center" });
          }
      }
  }, startFromChapter);
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Click the targeted chapter
  await page.evaluate((startFromChapter) => {
      const chapterItems = document.querySelectorAll(".chapter-item h3");
      const targetIndex = startFromChapter > 0 ? startFromChapter : 0;
      
      if (chapterItems.length > targetIndex) {
          chapterItems[targetIndex].click();
      } else {
          console.log(`Chapter at index ${targetIndex} not found. Clicking first chapter.`);
          if (chapterItems.length > 0) {
              chapterItems[0].click();
          }
      }
  }, startFromChapter);

  console.log(`Clicked on chapter at position ${startFromChapter > 0 ? startFromChapter : 0} successfully.`);
}

/**
* Scrapes a single chapter content
* @param {Page} page - Puppeteer page instance
* @returns {Promise<Object>} Chapter title and content
*/
async function scrapeChapterContent(page) {
  return await page.evaluate(() => {
      const chapterTitle = document.getElementById("span-28-1305853")?.innerText.trim() || "No title found";
      const paragraphs = Array.from(document.querySelectorAll('.ct-span p')).map(p => p.innerText.trim());
      const chapterText = paragraphs.join("\n\n"); // Preserve paragraph spacing
      
      return { title: chapterTitle, content: chapterText };
  });
}

/**
* Navigates to the next chapter
* @param {Page} page - Puppeteer page instance
* @returns {Promise<boolean>} Whether navigation was successful
*/
async function navigateToNextChapter(page) {
  try {
      const nextBtn = await page.$("#next-top");
      
      if (nextBtn) {
          await nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          await new Promise(resolve => setTimeout(resolve, 2000)); // Allow scrolling
          await nextBtn.click();
          console.log("Clicked on the next chapter button.");
          return true;
      } else {
          console.log("Next chapter button not found.");
          return false;
      }
  } catch (error) {
      console.error("Error navigating to next chapter:", error);
      return false;
  }
}

/**
* Scrapes all chapters of the novel or only new chapters
* @param {Page} page - Puppeteer page instance
* @param {number} totalChapters - Total number of chapters to scrape
* @param {number} existingChapters - Number of chapters already in the database
* @returns {Promise<Array>} Array of chapter objects with title and content
*/
async function scrapeChapters(page, totalChapters, existingChapters = 0) {
  const scrapedChapters = [];
  
  // If there are existing chapters, start from the next one
  const startChapter = existingChapters;
  
  // Navigate to the starting chapter
  await navigateToChapter(page, startChapter);

  // Calculate how many chapters to scrape
  const chaptersToScrape = totalChapters - existingChapters;
  
  // Scrape chapters one by one
  for (let i = 1; i <= chaptersToScrape; i++) {
      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });

      // Scrape chapter content
      const chapterInfo = await scrapeChapterContent(page);
      scrapedChapters.push(chapterInfo);
      console.log(`Scraped Chapter ${existingChapters + i}: ${chapterInfo.title}`);

      // Wait a bit before proceeding
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to next chapter if not the last one
      if (i < chaptersToScrape) {
          const success = await navigateToNextChapter(page);
          if (!success) {
              console.log("Could not navigate to next chapter. Stopping.");
              break;
          }
      }
  }

  return scrapedChapters;
}

module.exports = {
  scrapeNovelDetails,
  scrapeChapters,
  navigateToChapter
};