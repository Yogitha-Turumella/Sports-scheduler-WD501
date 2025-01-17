const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "sports_management",
  password: "Yogitha123@",
  port: 5432,
});
pool
  .connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Error connecting to PostgreSQL", err));

module.exports = pool;
