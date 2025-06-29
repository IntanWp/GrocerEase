# 🛒 GrocerEase

A grocery shopping application simulation that helps users manage their shopping with multiple cart types, recipe recommendations, and collaborative shopping features.

This is part of a software engineering course project where we learn and develop an application as a team. We learn and applied the core principles in software development from using tools for project management to using version control system like git to keep track of changes and work on the project as a team.

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** package manager

## ⚙️ Installation & Setup

### 1. Clone the repository
```
git clone <your-repo-url>
cd GrocerEase
```

### 2. Setup Backend
```
cd backend
npm install
```
Create a .env file in the backend directory with the following variables:
```
PORT=4000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### 3. Setup frontend
```
cd ../frontend
npm install
```

### 4. Run the application
Start the Backend Server
```
cd backend
npm start
```
or for development with auto-restart
```
npm run server
```
The backend server will run on http://localhost:4000

Start the Frontend Application
```
cd frontend
npm start
```
The frontend application will run on http://localhost:3000