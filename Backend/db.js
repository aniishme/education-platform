const { Pool } = require("pg");
require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
  quiet: true,
});
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL in Backend/.env");
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
