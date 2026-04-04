import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProjects = asyncHandler(async (req, res) => {
  let query = `
    SELECT p.*, u.name AS created_by_name
    FROM projects p
    LEFT JOIN users u ON u.id = p.created_by
  `;
  const params = [];

  if (req.user.role === 'student') {
    query += ' WHERE p.status IN (\'active\', \'pending\', \'completed\', \'overdue\')';
  }

  query += ' ORDER BY p.created_at DESC';

  const [rows] = await pool.query(query, params);

  const projects = rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    dueDate: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
    submissions: p.submissions_count,
    progress: p.progress,
    team: [],
    createdBy: p.created_by_name,
  }));

  res.json({ projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, dueDate, maxTeamSize, status } = req.body;

  const [result] = await pool.query(
    `INSERT INTO projects (title, description, due_date, max_team_size, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, dueDate || null, maxTeamSize || null, status || 'pending', req.user.id],
  );

  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
  const project = rows[0];

  res.status(201).json({
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      dueDate: project.due_date ? new Date(project.due_date).toISOString().slice(0, 10) : null,
      submissions: project.submissions_count,
      progress: project.progress,
      team: [],
    },
  });
});
