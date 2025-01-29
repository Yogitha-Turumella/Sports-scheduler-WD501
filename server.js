const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const pool = require("./database");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

const preventJoiningPastSessions = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId; // Assuming sessionId is passed in the route
    console.log("Session ID received:", sessionId); // Log the session ID

    const session = await pool.query(
      "SELECT * FROM sessions WHERE id = $1 AND date < NOW()",
      [sessionId]
    );
    if (!session) {
      console.log("Session not found."); // Log if session does not exist
      return res.redirect("/player-dashboard");
    }

    const currentTime = new Date();
    console.log("Current time:", currentTime); // Log the current time
    console.log("Session date and time:", session.date); // Log the session date and time

    if (new Date(session.date) < currentTime) {
      console.log("The session has already passed."); // Log if session is in the past
      return res.redirect("/player-dashboard");
    }

    if (session.cancelled) {
      console.log("The session has been cancelled."); // Log if session is cancelled
      return res.redirect("/player-dashboard");
    }

    next();
  } catch (error) {
    console.error("Error in preventJoiningPastSessions middleware:", error); // Log any errors
    return res.status(500).send("An error occurred.");
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rows.length > 0) {
    const match = await bcrypt.compare(password, user.rows[0].password);
    if (match) {
      req.session.user = user.rows[0];
      return res.redirect(
        user.rows[0].role === "admin" ? "/admin-dashboard" : "/player-dashboard"
      );
    }
  }

  res.redirect("/login?error=Invalid+email+or+password");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
    [name, email, hashedPassword, role]
  );
  res.redirect("/login");
});
app.get("/about-us", (req, res) => {
  res.render("about-us"); // Ensure about-us.ejs exists in the "views" folder
});

app.get("/admin-dashboard", isAuthenticated, async (req, res) => {
  const sports = await pool.query("SELECT * FROM sports");
  const sessions = await pool.query(`
    SELECT sessions.*, sports.name AS sport_name, users.name AS creator_name
    FROM sessions
    JOIN sports ON sessions.sport_id = sports.id
    JOIN users ON sessions.creator_id = users.id
  `);

  const sessionsWithPlayers = await Promise.all(
    sessions.rows.map(async (session) => {
      const players = await pool.query(
        `
      SELECT users.name, users.id
      FROM session_players 
      JOIN users ON session_players.player_id = users.id 
      WHERE session_players.session_id = $1
    `,
        [session.id]
      );
      return { ...session, players: players.rows };
    })
  );

  res.render("admin-dashboard", {
    user: req.session.user,
    sports: sports.rows,
    sessions: sessionsWithPlayers,
  });
});

app.post("/create-sport", isAuthenticated, async (req, res) => {
  try {
    console.log("Received data from form:", req.body); // Log the form data

    const { name } = req.body; // Get the sport name

    console.log("Sport name received:", name); // Log the extracted name

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).send("Sport name is required.");
    }

    // Insert into database
    await pool.query("INSERT INTO sports (name) VALUES ($1)", [name.trim()]);

    // Redirect to the admin dashboard
    res.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error creating sport:", error.message);
    res.status(500).send("Error creating sport.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/");
  });
});

app.post("/delete-session", isAuthenticated, async (req, res) => {
  try {
    const { session_id } = req.body;

    // Ensure session_id is parsed correctly as an integer
    const sessionIdInt = parseInt(session_id);

    // Start a database transaction
    await pool.query("BEGIN");

    // Delete associated records in session_players first
    await pool.query("DELETE FROM session_players WHERE session_id = $1", [
      sessionIdInt,
    ]);

    // Delete the session from the sessions table
    await pool.query("DELETE FROM sessions WHERE id = $1", [sessionIdInt]);

    // Commit the transaction
    await pool.query("COMMIT");

    // Redirect to admin dashboard after successful deletion
    res.redirect("/admin-dashboard");
  } catch (error) {
    // Rollback the transaction in case of an error
    await pool.query("ROLLBACK");

    console.error(error);
    res.status(500).send("Error deleting session");
  }
});

app.get("/player-dashboard", isAuthenticated, async (req, res) => {
  const user_id = req.session.user.id;

  const sessions = await pool.query(`
    SELECT sessions.*, sports.name AS sport_name
    FROM sessions
    JOIN sports ON sessions.sport_id = sports.id
  `);

  const joinedSessions = await pool.query(
    `
    SELECT sessions.*, sports.name AS sport_name
    FROM sessions
    JOIN sports ON sessions.sport_id = sports.id
    JOIN session_players ON sessions.id = session_players.session_id
    WHERE session_players.player_id = $1
  `,
    [user_id]
  );

  const sessionsWithPlayers = await Promise.all(
    sessions.rows.map(async (session) => {
      const players = await pool.query(
        `
      SELECT users.name, users.id 
      FROM session_players 
      JOIN users ON session_players.player_id = users.id 
      WHERE session_players.session_id = $1
    `,
        [session.id]
      );
      return { ...session, players: players.rows };
    })
  );

  const joinedSessionsWithPlayers = await Promise.all(
    joinedSessions.rows.map(async (session) => {
      const players = await pool.query(
        `
      SELECT users.name, users.id 
      FROM session_players 
      JOIN users ON session_players.player_id = users.id 
      WHERE session_players.session_id = $1
    `,
        [session.id]
      );
      return { ...session, players: players.rows };
    })
  );

  const sports = await pool.query("SELECT * FROM sports");
  console.log("Sports data:", sports.rows);
  res.render("player-dashboard", {
    user: req.session.user,
    sessions: sessionsWithPlayers,
    joinedSessions: joinedSessionsWithPlayers,
    sports: sports.rows,
  });
});

app.post("/create-session", isAuthenticated, async (req, res) => {
  const { sport_id, team1, team2, additional_players, date, venue } = req.body;

  try {
    await pool.query(
      "INSERT INTO sessions (sport_id, creator_id, team1, team2, additional_players, date, venue) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        sport_id,
        req.session.user.id,
        team1,
        team2,
        additional_players,
        date,
        venue,
      ]
    );

    res.redirect(
      req.session.user.role === "admin"
        ? "/admin-dashboard"
        : "/player-dashboard"
    );
  } catch (error) {
    console.error("Error creating session:", error);
    res.redirect(
      req.session.user.role === "admin"
        ? "/admin-dashboard?error=Failed+to+create+session"
        : "/player-dashboard?error=Failed+to+create+session"
    );
  }
});

app.post("/join-session/:sessionId", isAuthenticated, async (req, res) => {
  try {
    const { sessionId } = req.params; // Get sessionId from URL
    const userId = req.session.user.id;

    // Check if session ID is valid
    if (!sessionId) {
      return res.status(400).send("Session ID is required.");
    }

    // Check if user already joined
    const existing = await pool.query(
      "SELECT * FROM session_players WHERE session_id = $1 AND player_id = $2",
      [sessionId, userId]
    );

    if (existing.rows.length > 0) {
      console.log("User already joined this session.");
      return res.redirect(
        req.session.user.role === "admin"
          ? "/admin-dashboard"
          : "/player-dashboard"
      );
    }

    // Insert into session_players
    await pool.query(
      "INSERT INTO session_players (session_id, player_id) VALUES ($1, $2)",
      [sessionId, userId]
    );

    // Redirect to dashboard
    res.redirect(
      req.session.user.role === "admin"
        ? "/admin-dashboard"
        : "/player-dashboard"
    );
  } catch (error) {
    console.error("Error joining session:", error.message);
    res.status(500).send("An error occurred.");
  }
});

app.post("/cancel-session", isAuthenticated, async (req, res) => {
  const { session_id } = req.body; // Check the received session_id
  const user_id = req.session.user.id;

  console.log("Cancel Session Endpoint Hit");
  console.log("Session ID:", session_id);
  console.log("User ID:", user_id);

  try {
    // Check if the user is part of the session
    const sessionPlayer = await pool.query(
      "SELECT * FROM session_players WHERE session_id = $1 AND player_id = $2",
      [session_id, user_id]
    );

    if (sessionPlayer.rows.length > 0) {
      // Remove the player from the session
      await pool.query(
        "DELETE FROM session_players WHERE session_id = $1 AND player_id = $2",
        [session_id, user_id]
      );
      console.log("Player removed from session:", session_id);
    } else {
      console.log("Player not part of the session");
    }

    // Redirect back to the dashboard
    res.redirect("/player-dashboard");
  } catch (err) {
    console.error("Error handling cancel session:", err);
    res.status(500).send("An error occurred");
  }
});

app.get("/reports", isAuthenticated, async (req, res) => {
  try {
    const sessionsQuery = `
      SELECT sessions.*, sports.name AS sport_name
      FROM sessions
      JOIN sports ON sessions.sport_id = sports.id
    `;
    const sessions = await pool.query(sessionsQuery);

    const popularityQuery = `
      SELECT sports.name, COUNT(sessions.id) AS count
      FROM sessions
      JOIN sports ON sessions.sport_id = sports.id
      GROUP BY sports.name
    `;
    const popularity = await pool.query(popularityQuery);

    res.render("reports", {
      sessions: sessions.rows,
      popularity: popularity.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching reports.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
