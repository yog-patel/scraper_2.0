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
  connectionString: process.env.DB_URL,//process.env.DB_URL,
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