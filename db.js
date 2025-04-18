const { Client } = require("pg");

const client = new Client({
  user: "yogpatel", // e.g., yogpatel
  host: "localhost",
  database: "my_scraper_db", // Make sure this matches the DB you created
  password: "", // If your local PostgreSQL has a password, add it here
  port: 5432,
});

client.connect();

module.exports = client;