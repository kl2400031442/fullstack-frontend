import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Missing token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
}

export function teacherOrAdminOnly(req, res, next) {
  if (!['teacher', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Only teachers/admins can perform this action.' });
  }
  return next();
}
