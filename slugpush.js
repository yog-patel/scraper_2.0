// 1. Import database client
const { Client } = require('pg'); // or 'mysql2' if you're using MySQL

// 2. Slugify function
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

// 3. Connect to database
const client = new Client({
    connectionString: "postgresql://carnage:ABEUEEbCtea4a7nSpDOXdHgs8xIewl8F@dpg-d00pbvk9c44c73cj0gmg-a.virginia-postgres.render.com/scraped_info",//process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false, // Render requires this for SSL
    },
});

async function updateSlugs() {
  try {
    await client.connect();
    console.log('Connected to database ✅');

    // Fetch all novels
    const res = await client.query('SELECT novel_id, title FROM novels');
    const novels = res.rows;

    console.log(`Found ${novels.length} novels.`);

    // Loop through novels
    for (const novel of novels) {
      const slug = slugify(novel.title);

      // Update slug
      await client.query('UPDATE novels SET slug = $1 WHERE novel_id = $2', [slug, novel.novel_id]);
      console.log(`Updated novel id=${novel.novel_id}, slug=${slug}`);
    }

    console.log('✅ All slugs updated!');
  } catch (err) {
    console.error('❌ Error updating slugs:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database.');
  }
}

// Run the function
updateSlugs();
