🏆 Sports Session Management App
A web-based application designed for managing sports sessions, allowing users to register, log in, create, and join sessions. The system supports two types of users: Admins and Players.

Admins can manage sports, schedule sessions, and generate reports, while players can browse, join, and leave sports sessions. The project is built using Node.js, Express.js, PostgreSQL, and EJS, ensuring a robust and scalable solution for managing sports activities.

📌 Features
User Authentication – Secure login and registration system with password hashing.
Admin Dashboard – Create, delete, and manage sports sessions.
Player Dashboard – View and join available sports sessions.
Session Management – Admins can create, cancel, and delete sessions. Players can join or leave sessions.
Reports & Analytics – Admins can track session popularity and participation trends.
Secure Authentication – Passwords are securely hashed using bcryptjs.
Role-Based Access Control – Separate functionalities for Admins and Players.
🛠️ Technologies Used
This project is built with modern web technologies to ensure a secure and efficient application.

Node.js for the backend server.
Express.js as the web framework for API and route handling.
bcryptjs for secure password hashing.
PostgreSQL as the database to store user, session, and sport data.
EJS as the templating engine for rendering dynamic HTML.
express-session for managing user authentication and sessions.
📸 Screenshots
Homepage
(home.png)
Login
(login.png)
Register
(register.png)
Admin Dashboard
(admin1.png)
(admin2.png)
Player Dashboard
(player1.png)
(player2.png)

Reports
(reports.png)
(reports2.png)

aboutus
(aboutus.png)

📦 Installation Guide
🔹 Prerequisites
Before running this application, ensure you have the following installed on your system:

Node.js (version 14 or later)
npm (Node Package Manager)
PostgreSQL (version 12 or later)
🔹 Setup Instructions
Clone the Repository

git clone https://github.com/your-username/sports-session-management-app.git
Navigate to the project directory:

cd sports-session-management-app
Install Dependencies

npm install
Set Up PostgreSQL Database

Create a new PostgreSQL database (e.g., sports_sessions).
Update the database.js file with your PostgreSQL connection credentials.
Run the following SQL commands to create the necessary tables:
sql
Copy
Edit
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(50) CHECK (role IN ('admin', 'player')) NOT NULL
);

CREATE TABLE sports (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL
);

CREATE TABLE sessions (
id SERIAL PRIMARY KEY,
sport_id INT REFERENCES sports(id),
creator_id INT REFERENCES users(id),
team1 VARCHAR(100),
team2 VARCHAR(100),
additional_players INT DEFAULT 0,
date TIMESTAMP,
venue VARCHAR(255),
cancelled BOOLEAN DEFAULT FALSE,
cancellation_reason TEXT
);

CREATE TABLE session_players (
session_id INT REFERENCES sessions(id),
player_id INT REFERENCES users(id),
PRIMARY KEY (session_id, player_id)
);
Start the Server

npm start
The application will now be running at http://localhost:3000 🎉

🌍 Application Routes
GET / - Home page
GET /login - User login page
POST /login - Handles user login authentication
GET /register - User registration page
POST /register - Handles new user registration
GET /admin-dashboard - Admin dashboard for managing sports and sessions
POST /create-sport - Action to add a new sport
POST /delete-session - Deletes an existing session
GET /player-dashboard - Player dashboard to view and join sessions
POST /create-session - Allows admins to create new sessions
POST /join-session/:sessionId - Allows players to join a session
POST /cancel-session - Allows players to cancel their participation in a session
GET /reports - Admins can view reports about session popularity
👥 User Roles & Permissions
👑 Admin
Admins have full control over the sports session management system. They can:

Create and manage different sports and sessions.
View reports on session participation and popularity.
Delete or cancel sports sessions when necessary.
🏅 Player
Players can participate in sports sessions by:

Register and log in.
Join available sessions.
View session details and other players.
Security Considerations
Passwords are hashed using bcryptjs to ensure security.
Sessions are managed using express-session to keep users authenticated.
Contributing
Contributions are welcome! Please fork the repository and submit a pull request with any improvements or features.
