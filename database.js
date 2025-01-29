const { Pool } = require("pg");

// Configure the database connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sports_management",
  password: "Yogitha123@",
  port: 5432,
});

// Log successful connection
pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

// Log errors
pool.on("error", (err) => {
  console.error("Unexpected error on PostgreSQL client", err);
  process.exit(-1); // Exit the process in case of critical errors
});

module.exports = pool;
