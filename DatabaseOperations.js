// db-operations.js
const xata = require("./db");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')                 // Normalize accented letters
    .replace(/[\u0300-\u036f]/g, '')   // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')      // Remove special characters
    .trim()
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .replace(/-+/g, '-');              // Collapse multiple hyphens
}

// Function to check if novel exists
async function checkNovelExists(title, author) {
  try {
    const result = await xata.db.novels
      .filter({ title, author })
      .getFirst();
    
    if (result) {
      console.log(`Novel "${title}" by ${author} already exists with ID: ${result.id}`);
      return result;
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
    const result = await xata.db.chapters
      .filter({ novel_id: novelId })
      .sort("chapter_number", "desc")
      .getFirst();
    
    return result ? result.chapter_number : 0;
  } catch (error) {
    console.error("Error getting latest chapter number:", error);
    return 0;
  }
}

// Function to update timestamps
async function updateTimestamp(tableName, idColumn, idValue) {
  try {
    await xata.db[tableName].update(idValue, {
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating timestamp for ${tableName}:`, error);
  }
}

// Function to update novel rating
async function updateNovelRating(novelId) {
  try {
    const ratings = await xata.db.ratings
      .filter({ novel_id: novelId })
      .getAll();
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;
    
    await xata.db.novels.update(novelId, {
      average_rating: averageRating
    });
  } catch (error) {
    console.error("Error updating novel rating:", error);
  }
}

// Function to add or update a rating
async function addOrUpdateRating(novelId, userId, score, review = null) {
  try {
    const existingRating = await xata.db.ratings
      .filter({ novel_id: novelId, user_id: userId })
      .getFirst();
    
    if (existingRating) {
      await xata.db.ratings.update(existingRating.id, {
        score,
        review,
        updated_at: new Date().toISOString()
      });
    } else {
      await xata.db.ratings.create({
        novel_id: novelId,
        user_id: userId,
        score,
        review,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Update the novel's average rating
    await updateNovelRating(novelId);
    return true;
  } catch (error) {
    console.error("Error adding/updating rating:", error);
    return false;
  }
}

// Function to update novel metadata
async function updateNovelMetadata(novelId, novel) {
  try {
    // Update novel basic info
    await xata.db.novels.update(novelId, {
      description: novel.description,
      cover_image_url: novel.cover_image_url,
      status: novel.status.toLowerCase(),
      updated_at: new Date().toISOString()
    });
    
    // Update genres
    if (novel.genres && novel.genres.length > 0) {
      // Get existing genres
      const existingGenres = await xata.db.novel_genres
        .filter({ novel_id: novelId })
        .getAll();
      
      // Remove existing genres
      for (const genre of existingGenres) {
        await xata.db.novel_genres.delete(genre.id);
      }
      
      // Add new genres
      for (const genreName of novel.genres) {
        // Get or create genre
        let genre = await xata.db.genres
          .filter({ name: genreName })
          .getFirst();
        
        if (!genre) {
          genre = await xata.db.genres.create({
            name: genreName,
            created_at: new Date().toISOString()
          });
        }
        
        // Link novel to genre
        await xata.db.novel_genres.create({
          novel_id: novelId,
          genre_id: genre.id
        });
      }
    }
    
    // Update tags
    if (novel.tags && novel.tags.length > 0) {
      // Get existing tags
      const existingTags = await xata.db.novel_tags
        .filter({ novel_id: novelId })
        .getAll();
      
      // Remove existing tags
      for (const tag of existingTags) {
        await xata.db.novel_tags.delete(tag.id);
      }
      
      // Add new tags
      for (const tagName of novel.tags) {
        // Get or create tag
        let tag = await xata.db.tags
          .filter({ name: tagName })
          .getFirst();
        
        if (!tag) {
          tag = await xata.db.tags.create({
            name: tagName,
            created_at: new Date().toISOString()
          });
        }
        
        // Link novel to tag
        await xata.db.novel_tags.create({
          novel_id: novelId,
          tag_id: tag.id
        });
      }
    }
    
    console.log(`Novel metadata updated for ID: ${novelId}`);
    return true;
  } catch (error) {
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
      await updateNovelMetadata(existingNovel.id, novel);
      return existingNovel.id;
    }
    
    // If novel doesn't exist, insert it
    const novelRecord = await xata.db.novels.create({
      title: novel.title,
      author: novel.author,
      description: novel.description,
      cover_image_url: novel.cover_image_url,
      status: novel.status.toLowerCase(),
      slug: slugify(novel.title),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    const novelId = novelRecord.id;
    
    // Process genres
    if (novel.genres && novel.genres.length > 0) {
      for (const genreName of novel.genres) {
        // Get or create genre
        let genre = await xata.db.genres
          .filter({ name: genreName })
          .getFirst();
        
        if (!genre) {
          genre = await xata.db.genres.create({
            name: genreName,
            created_at: new Date().toISOString()
          });
        }
        
        // Link novel to genre
        await xata.db.novel_genres.create({
          novel_id: novelId,
          genre_id: genre.id
        });
      }
    }

    // Process tags
    if (novel.tags && novel.tags.length > 0) {
      for (const tagName of novel.tags) {
        // Get or create tag
        let tag = await xata.db.tags
          .filter({ name: tagName })
          .getFirst();
        
        if (!tag) {
          tag = await xata.db.tags.create({
            name: tagName,
            created_at: new Date().toISOString()
          });
        }
        
        // Link novel to tag
        await xata.db.novel_tags.create({
          novel_id: novelId,
          tag_id: tag.id
        });
      }
    }
    
    console.log(`Novel inserted with ID: ${novelId}`);
    return novelId;
  } catch (error) {
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
    
    let newChaptersCount = 0;
    
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterNumber = latestChapterNumber + i + 1;
      
      // Check if this chapter already exists
      const chapterExists = await xata.db.chapters
        .filter({ novel_id: novelId, chapter_number: chapterNumber })
        .getFirst();
      
      if (chapterExists) {
        console.log(`Chapter ${chapterNumber} already exists. Skipping.`);
        continue;
      }
      
      await xata.db.chapters.create({
        novel_id: novelId,
        chapter_number: chapterNumber,
        title: chapter.title,
        content: chapter.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_free: true
      });
      
      newChaptersCount++;
      console.log(`Chapter ${chapterNumber} inserted.`);
    }
    
    // Update the novel's updated_at timestamp
    await updateTimestamp('novels', 'id', novelId);
    
    console.log(`${newChaptersCount} new chapters inserted successfully.`);
    return newChaptersCount;
  } catch (error) {
    console.error("Error inserting chapters:", error);
    return 0;
  }
}

// Export the functions
module.exports = {
  insertNovel,
  insertChapters,
  checkNovelExists,
  updateNovelMetadata,
  getLatestChapterNumber,
  addOrUpdateRating,
  updateNovelRating
};
