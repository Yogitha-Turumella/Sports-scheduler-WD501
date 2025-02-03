# sports-scheduler

Sports Session Management App
Description
This is a web-based application for managing sports sessions, allowing users to register, log in, create sessions, and join them. It features two types of users: Admins and Players. Admins can create sports, manage sessions, and view reports, while players can join available sessions. The application uses Express, PostgreSQL, bcryptjs for authentication, and EJS for rendering dynamic content.

Features
Authentication: Users can register, log in, and log out.
Admin Dashboard: Admins can manage sports, sessions, and view detailed reports.
Player Dashboard: Players can view available sessions and join them.
Session Management: Admins can create, delete, and cancel sessions. Players can join and leave sessions.
Reports: Admins can view reports about session popularity by sport.
Technologies Used
Node.js: Backend framework to run the application.
Express: Web framework for building the app.
bcryptjs: For hashing passwords.
PostgreSQL: Database for storing user data, sports, sessions, and other related data.
EJS: Template engine for rendering dynamic HTML.
express-session: For handling user sessions.
Installation
Prerequisites
Node.js (>=14.x)
npm (Node package manager)
PostgreSQL (>=12.x)
Steps to Setup
Clone this repository:

git clone https://github.com/your-username/sports-session-management-app.git
Navigate to the project directory:


cd sports-session-management-app
Install the required dependencies:

npm install
Set up PostgreSQL:

Create a PostgreSQL database (e.g., sports_sessions).
Update the database connection configuration in the ./database.js file.
Run the migrations to create the necessary tables (example for users and sessions):

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
Start the server:

npm start
The app will run on http://localhost:3000.

Application Routes
GET /: Home page.
GET /login: Login page.
POST /login: Login action.
GET /register: Register page.
POST /register: Registration action.
GET /admin-dashboard: Admin dashboard to manage sessions and sports.
POST /create-sport: Action to create a new sport.
POST /delete-session: Action to delete a session.
GET /player-dashboard: Player dashboard to view and join sessions.
POST /create-session: Action to create a new session.
POST /join-session: Action to join a session.
POST /cancel-session: Action to cancel a session.
GET /reports: Admin can view reports about session popularity.
User Roles
Admin:

Create and manage sports and sessions.
View reports on session popularity.
Delete or cancel sessions.
Player:

Register and log in.
Join available sessions.
View session details and other players.
Security Considerations
Passwords are hashed using bcryptjs to ensure security.
Sessions are managed using express-session to keep users authenticated.
Contributing
Contributions are welcome! Please fork the repository and submit a pull request with any improvements or features.

Walkthrough of the application:
![image](https://github.com/user-attachments/assets/8171cc91-723d-491c-8cdb-4191c60b5503)

![image](https://github.com/user-attachments/assets/149852ec-533c-4588-8f6d-4c7f8ecbcc9b)

![image](https://github.com/user-attachments/assets/1c969952-bc2a-427e-828e-6cf79ff75b31)

![image](https://github.com/user-attachments/assets/fa450d35-12b9-479f-9726-f853dce98fd9)

![image](https://github.com/user-attachments/assets/53b7a49e-f17e-45f1-a288-f32f7aaa15dd)

![image](https://github.com/user-attachments/assets/99d20343-cf38-4baf-8d03-51f863e28645)

![image](https://github.com/user-attachments/assets/690198bc-af3b-4ce4-ba23-a7c82bd94522)

![image](https://github.com/user-attachments/assets/ec92532c-a2f0-4928-b9b6-c6866c1400b9)

![image](https://github.com/user-attachments/assets/b9d36e58-6623-481b-a990-48a2c70a712b)










