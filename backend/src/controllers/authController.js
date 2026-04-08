import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

const MFA_TTL_MINUTES = Number(process.env.MFA_CODE_TTL_MINUTES || 10);

function signAuthToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function signMfaToken(userId) {
  return jwt.sign({ userId, type: 'mfa' }, process.env.JWT_SECRET, { expiresIn: `${MFA_TTL_MINUTES}m` });
}

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  identifier: user.role === 'teacher' ? user.teacher_code : user.student_id,
  department: user.department,
});

async function findAndValidateStudent({ name, studentId, password }) {
  const [users] = await pool.query(
    `SELECT * FROM users WHERE role = 'student' AND (student_id = ? OR name = ?) LIMIT 1`,
    [studentId || null, name || null],
  );

  const user = users[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

async function findAndValidateTeacher({ teacherCode, password }) {
  const [users] = await pool.query(
    `SELECT * FROM users WHERE role = 'teacher' AND teacher_code = ? LIMIT 1`,
    [teacherCode],
  );

  const user = users[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    res.status(409);
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const studentId = role === 'student' ? String(Date.now()).slice(-10) : null;
  const teacherCode = role === 'teacher' ? String(Math.floor(1000 + Math.random() * 9000)) : null;

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, student_id, teacher_code)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, role, studentId, teacherCode],
  );

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  const user = users[0];

  const token = signAuthToken(user);
  res.status(201).json({ message: 'Signup successful', token, user: mapUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { role, name, studentId, teacherCode, password } = req.body;

  let user;
  if (role === 'student') {
    user = await findAndValidateStudent({ name, studentId, password });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = signAuthToken(user);
    return res.json({ token, user: mapUser(user) });
  }

if (role === 'admin') {
  const [admins] = await pool.query(
    `SELECT * FROM users WHERE role = 'admin' AND email = ? LIMIT 1`,
    [req.body.email || ''],
  );
  const adminUser = admins[0];

  if (!adminUser) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, adminUser.password_hash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signAuthToken(adminUser);
  return res.json({ token, user: mapUser(adminUser) });
}
  if (role === 'teacher') {
    user = await findAndValidateTeacher({ teacherCode, password });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const mfaCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiryDate = new Date(Date.now() + MFA_TTL_MINUTES * 60 * 1000);

    await pool.query('UPDATE users SET mfa_code = ?, mfa_expires_at = ? WHERE id = ?', [
      mfaCode,
      expiryDate,
      user.id,
    ]);

    return res.json({
      mfaRequired: true,
      mfaToken: signMfaToken(user.id),
      mfaCode: process.env.NODE_ENV !== 'production' ? mfaCode : undefined,
      user: mapUser(user),
    });
  }

  res.status(400);
throw new Error('Invalid role. Use student, teacher, or admin.');

export const verifyMfa = asyncHandler(async (req, res) => {
  const { code, mfaToken } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired MFA token');
  }

  if (decoded.type !== 'mfa') {
    res.status(401);
    throw new Error('Invalid MFA token type');
  }

  const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.userId]);
  const user = users[0];

  if (!user || !user.mfa_code || !user.mfa_expires_at) {
    res.status(401);
    throw new Error('No pending MFA challenge found');
  }

  if (String(user.mfa_code) !== String(code) || new Date(user.mfa_expires_at) < new Date()) {
    res.status(401);
    throw new Error('Invalid or expired MFA code');
  }

  await pool.query('UPDATE users SET mfa_code = NULL, mfa_expires_at = NULL WHERE id = ?', [user.id]);

  const token = signAuthToken(user);
  res.json({ token, user: mapUser(user) });
});
