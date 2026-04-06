# PeerCollab (Frontend + Backend)

This repository now includes:

* **Frontend**: React + Vite app
* **Backend**: Node.js + Express + MySQL API

---

## Backend features

* Signup & Login APIs
* Projects APIs
* MySQL database connection
* Clean folder structure

---

## Backend Setup

### 1) Create MySQL Database

```sql
CREATE DATABASE peercollab;
USE peercollab;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(190) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50)
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180),
  description TEXT
);
```

---

### 2) Setup Backend

```bash
cd backend
npm install
```

---

### 3) Run Backend

```bash
node server.js
```

Backend runs at:
http://localhost:5000

---

## Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at:
http://localhost:5173

---

## API Base URL

Create `.env` file in root:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Done 🎉

* Signup works
* Login works
* Projects fetch works
