import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createSubmission = asyncHandler(async (req, res) => {
  const { projectId, fileUrl } = req.body;

  if (req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can upload submissions');
  }

  await pool.query(
    `INSERT INTO submissions (project_id, student_id, file_url, status)
     VALUES (?, ?, ?, 'Submitted')
     ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), status = 'Submitted', review_comment = NULL, reviewed_by = NULL, reviewed_at = NULL`,
    [projectId, req.user.id, fileUrl],
  );

  await pool.query('UPDATE projects SET submissions_count = submissions_count + 1 WHERE id = ?', [projectId]);

  res.status(201).json({ message: 'Submission uploaded', status: 'Submitted' });
});

export const getSubmissionsForTeacher = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, p.title AS project_title, u.name AS student_name
     FROM submissions s
     INNER JOIN projects p ON p.id = s.project_id
     INNER JOIN users u ON u.id = s.student_id
     ORDER BY s.submitted_at DESC`,
  );

  res.json({ submissions: rows });
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewComment } = req.body;

  const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [id]);
  const submission = rows[0];
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  await pool.query(
    `UPDATE submissions
     SET review_comment = ?, status = 'Reviewed', reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ?`,
    [reviewComment || '', req.user.id, id],
  );

  await pool.query(
    `INSERT IGNORE INTO completed_courses (student_id, project_id, completed_at)
     VALUES (?, ?, NOW())`,
    [submission.student_id, submission.project_id],
  );

  await pool.query("UPDATE submissions SET status = 'Completed' WHERE id = ?", [id]);

  res.json({ message: 'Submission reviewed and marked completed', status: 'Completed' });
});

export const getCompletedCourses = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT cc.id, cc.completed_at, p.id AS project_id, p.title, p.description
     FROM completed_courses cc
     INNER JOIN projects p ON p.id = cc.project_id
     WHERE cc.student_id = ?
     ORDER BY cc.completed_at DESC`,
    [req.user.id],
  );

  res.json({ completedCourses: rows });
});
