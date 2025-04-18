const { Client } = require("pg");

// const client = new Client({
//   user: "yogpatel", // e.g., yogpatel
//   host: "localhost",
//   database: "my_scraper_db", // Make sure this matches the DB you created
//   password: "", // If your local PostgreSQL has a password, add it here
//   port: 5432,
// });

// client.connect();

// module.exports = client;

// const { Client } = require("pg");

// Use the external database URL from Render
const client = new Client({
  connectionString: "postgresql://carnage:ABEUEEbCtea4a7nSpDOXdHgs8xIewl8F@dpg-d00pbvk9c44c73cj0gmg-a.virginia-postgres.render.com/scraped_info",//process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false, // Render requires this for SSL
  },
});

client.connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

module.exports = client;