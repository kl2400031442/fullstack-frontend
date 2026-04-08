import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProjects = asyncHandler(async (req, res) => {
// GET PROJECTS
export const getProjects = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const [rows] = await pool.query(
      `SELECT p.*, s.status AS submission_status
       FROM project_assignments pa
       INNER JOIN projects p ON p.id = pa.project_id
       LEFT JOIN submissions s ON s.project_id = p.id AND s.student_id = pa.student_id
       WHERE pa.student_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );

    return res.json({
      projects: rows.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.submission_status || 'Pending',
        dueDate: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
        submissions: p.submissions_count,
        progress: p.progress,
        team: [],
      })),
    });
  }

  const [rows] = await pool.query(
    `SELECT p.*, u.name AS created_by_name
     FROM projects p
     LEFT JOIN users u ON u.id = p.created_by
     ORDER BY p.created_at DESC`,
  );

  return res.json({
    projects: rows.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      dueDate: p.due_date ? new Date(p.due_date).toISOString().slice(0, 10) : null,
      submissions: p.submissions_count,
      progress: p.progress,
      team: [],
      createdBy: p.created_by_name,
    })),
  });
});


// CREATE PROJECT
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, dueDate, maxTeamSize, status, assignedStudentIds = [] } = req.body;

  const [result] = await pool.query(
    `INSERT INTO projects (title, description, due_date, max_team_size, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, dueDate || null, maxTeamSize || null, status || 'pending', req.user.id],
  );

  const projectId = result.insertId;

  if (Array.isArray(assignedStudentIds) && assignedStudentIds.length > 0) {
    const values = assignedStudentIds.map((studentId) => [projectId, Number(studentId)]);
    await pool.query(
      'INSERT IGNORE INTO project_assignments (project_id, student_id) VALUES ?',
      [values],
    );
  }

  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
  const project = rows[0];

  res.status(201).json({ project });
});

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
