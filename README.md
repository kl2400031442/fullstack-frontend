# PeerCollab LMS (React + Node.js + MySQL)

This project supports a complete LMS system for:

* 👨‍🎓 Students
* 👨‍🏫 Teachers
* 👑 Admin

---

## 🔥 Features

### Student Dashboard

* View assigned tasks
* Upload files
* Status:

  * Pending
  * Submitted
  * Reviewed
  * Completed
* Completed Courses section

---

### Teacher Dashboard

* View student submissions
* Review files
* Add comments
* Mark as reviewed/completed

---

### Admin Dashboard

* Create tasks
* Assign tasks to students

---

## 🗄️ Database Tables

* users
* projects
* project_assignments
* submissions
* completed_courses

---

## 🚀 Backend Run

```bash
cd backend
npm install
npm run dev
```

---

## 🌐 Frontend Run

```bash
npm install
npm run dev
```

---

## 🔗 API Base URL

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🎯 Final Flow

Student → Upload → Submitted
Teacher → Review → Completed
Admin → Assign Tasks

---

## 🎉 Project Ready

* Full LMS system
* Role-based dashboards
* File upload + review system
