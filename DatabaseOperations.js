// db-operations.js
const client = require("./db");

// Function to check if novel exists
async function checkNovelExists(title, author) {
  try {
    const result = await client.query(
      `SELECT novel_id, title, author FROM novels WHERE title = $1 AND author = $2`,
      [title, author]
    );
    
    if (result.rows.length > 0) {
      console.log(`Novel "${title}" by ${author} already exists with ID: ${result.rows[0].novel_id}`);
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error checking if novel exists:", error);
    return null;
  }
}

// Function to get the latest chapter number for a novel
async function getLatestChapterNumber(novelId) {
  try {
    const result = await client.query(
      `SELECT MAX(chapter_number) as latest_chapter FROM chapters WHERE novel_id = $1`,
      [novelId]
    );
    
    return result.rows[0].latest_chapter || 0;
  } catch (error) {
    console.error("Error getting latest chapter number:", error);
    return 0;
  }
}

// Function to update novel metadata
async function updateNovelMetadata(novelId, novel) {
  try {
    await client.query('BEGIN');
    
    // Update novel basic info
    await client.query(
      `UPDATE novels SET 
        description = $1, 
        cover_image_url = $2, 
        status = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE novel_id = $4`,
      [
        novel.description,
        novel.cover_image_url,
        novel.status.toLowerCase(),
        novelId
      ]
    );
    
    // Update genres - First remove existing
    if (novel.genres && novel.genres.length > 0) {
      // Clear existing genres
      await client.query(
        `DELETE FROM novel_genres WHERE novel_id = $1`,
        [novelId]
      );
      
      // Add new genres
      for (const genreName of novel.genres) {
        // Insert genre if it doesn't exist
        await client.query(
          `INSERT INTO genres (name) 
           VALUES ($1) 
           ON CONFLICT (name) DO NOTHING`,
          [genreName]
        );
        
        // Get genre_id
        const genreResult = await client.query(
          `SELECT genre_id FROM genres WHERE name = $1`,
          [genreName]
        );
        
        // Link novel to genre
        if (genreResult.rows.length > 0) {
          await client.query(
            `INSERT INTO novel_genres (novel_id, genre_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [novelId, genreResult.rows[0].genre_id]
          );
        }
      }
    }
    
    // Update tags - First remove existing
    if (novel.tags && novel.tags.length > 0) {
      // Clear existing tags
      await client.query(
        `DELETE FROM novel_tags WHERE novel_id = $1`,
        [novelId]
      );
      
      // Add new tags
      for (const tagName of novel.tags) {
        // Insert tag if it doesn't exist
        await client.query(
          `INSERT INTO tags (name) 
           VALUES ($1) 
           ON CONFLICT (name) DO NOTHING`,
          [tagName]
        );
        
        // Get tag_id
        const tagResult = await client.query(
          `SELECT tag_id FROM tags WHERE name = $1`,
          [tagName]
        );
        
        // Link novel to tag
        if (tagResult.rows.length > 0) {
          await client.query(
            `INSERT INTO novel_tags (novel_id, tag_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [novelId, tagResult.rows[0].tag_id]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`Novel metadata updated for ID: ${novelId}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating novel metadata:", error);
    return false;
  }
}

// Function to insert novel data
async function insertNovel(novel) {
  try {
    // Check if novel already exists
    const existingNovel = await checkNovelExists(novel.title, novel.author);
    if (existingNovel) {
      // Update metadata if novel exists
      await updateNovelMetadata(existingNovel.novel_id, novel);
      return existingNovel.novel_id;
    }
    
    // If novel doesn't exist, insert it
    // Begin transaction
    await client.query('BEGIN');
    
    // 1. Insert the novel
    const novelResult = await client.query(
      `INSERT INTO novels (
        title, 
        author, 
        description, 
        cover_image_url, 
        status
      ) VALUES ($1, $2, $3, $4, $5) RETURNING novel_id`,
      [
        novel.title,
        novel.author,
        novel.description,
        novel.cover_image_url,
        novel.status.toLowerCase(), // Convert to lowercase to match CHECK constraint
      ]
    );
    
    const novelId = novelResult.rows[0].novel_id;
    
    // 2. Process genres
    if (novel.genres && novel.genres.length > 0) {
      for (const genreName of novel.genres) {
        // Insert genre if it doesn't exist
        await client.query(
          `INSERT INTO genres (name) 
           VALUES ($1) 
           ON CONFLICT (name) DO NOTHING`,
          [genreName]
        );
        
        // Get genre_id
        const genreResult = await client.query(
          `SELECT genre_id FROM genres WHERE name = $1`,
          [genreName]
        );
        
        // Link novel to genre
        if (genreResult.rows.length > 0) {
          await client.query(
            `INSERT INTO novel_genres (novel_id, genre_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [novelId, genreResult.rows[0].genre_id]
          );
        }
      }
    }

    // 3. Process tags separately
    if (novel.tags && novel.tags.length > 0) {
      for (const tagName of novel.tags) {
        // Insert tag if it doesn't exist
        await client.query(
          `INSERT INTO tags (name) 
           VALUES ($1) 
           ON CONFLICT (name) DO NOTHING`,
          [tagName]
        );
        
        // Get tag_id
        const tagResult = await client.query(
          `SELECT tag_id FROM tags WHERE name = $1`,
          [tagName]
        );
        
        // Link novel to tag
        if (tagResult.rows.length > 0) {
          await client.query(
            `INSERT INTO novel_tags (novel_id, tag_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [novelId, tagResult.rows[0].tag_id]
          );
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`Novel inserted with ID: ${novelId}`);
    return novelId;
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error inserting novel:", error);
    return null;
  }
}

// Function to insert chapter data
async function insertChapters(novelId, chapters) {
  try {
    // Get the latest chapter number for this novel
    const latestChapterNumber = await getLatestChapterNumber(novelId);
    console.log(`Current latest chapter: ${latestChapterNumber}`);
    
    // Begin transaction
    await client.query('BEGIN');
    
    let newChaptersCount = 0;
    
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterNumber = latestChapterNumber + i + 1;
      
      // Check if this chapter already exists
      const chapterExists = await client.query(
        `SELECT chapter_id FROM chapters WHERE novel_id = $1 AND chapter_number = $2`,
        [novelId, chapterNumber]
      );
      
      if (chapterExists.rows.length > 0) {
        console.log(`Chapter ${chapterNumber} already exists. Skipping.`);
        continue;
      }
      
      await client.query(
        `INSERT INTO chapters (
          novel_id, 
          chapter_number, 
          title, 
          content, 
          created_at,
          is_free
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          novelId, 
          chapterNumber, 
          chapter.title, 
          chapter.content, 
          new Date(),
          true // Assuming all scraped chapters are free
        ]
      );
      
      newChaptersCount++;
      console.log(`Chapter ${chapterNumber} inserted.`);
    }
    
    // Update the novel's updated_at timestamp
    await client.query(
      `UPDATE novels SET updated_at = CURRENT_TIMESTAMP WHERE novel_id = $1`,
      [novelId]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`${newChaptersCount} new chapters inserted successfully.`);
    return newChaptersCount;
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error inserting chapters:", error);
    return 0;
  }
}

// Close the database connection function
async function closeDbConnection() {
  await client.end();
  console.log("Database connection closed.");
}

// Export the functions
module.exports = {
  insertNovel,
  insertChapters,
  checkNovelExists,
  updateNovelMetadata,
  getLatestChapterNumber,
  closeDbConnection
};