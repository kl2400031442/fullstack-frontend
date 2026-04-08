import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
const { loginStudent, loginTeacher, loginAdmin, verifyMfa, mfaPending, mfaCode } = useAuth();

const navigate = useNavigate();

const [role, setRole] = useState('student');
const [studentForm, setStudentForm] = useState({ nameOrId: '', password: '' });
const [teacherForm, setTeacherForm] = useState({ teacherCode: '', password: '' });
const [adminForm, setAdminForm] = useState({ email: '', password: '' });
const [mfaInput, setMfaInput] = useState('');
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

// STUDENT VALIDATION
const validateStudent = () => {
  const errs = {};
  const val = studentForm.nameOrId.trim();
  if (!val) errs.nameOrId = 'Name or Student ID is required';
  if (!studentForm.password) errs.password = 'Password is required';
  return errs;
};

// TEACHER VALIDATION
const validateTeacher = () => {
  const errs = {};
  if (!teacherForm.teacherCode) errs.teacherCode = 'Teacher Code is required';
  if (!teacherForm.password) errs.password = 'Password is required';
  return errs;
};

// ADMIN VALIDATION
const validateAdmin = () => {
  const errs = {};
  if (!adminForm.email) errs.email = 'Email is required';
  if (!adminForm.password) errs.password = 'Password is required';
  return errs;
};

// SUBMIT
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  try {
    setIsSubmitting(true);

    if (role === 'student') {
      const errs = validateStudent();
      if (Object.keys(errs).length) return setErrors(errs);

      const val = studentForm.nameOrId.trim();
      const isId = /^\d{10}$/.test(val);

      await loginStudent({
        name: isId ? '' : val,
        studentId: isId ? val : '',
        password: studentForm.password,
      });

      navigate('/student-dashboard');
    }

    else if (role === 'teacher') {
      const errs = validateTeacher();
      if (Object.keys(errs).length) return setErrors(errs);

      await loginTeacher({
        teacherCode: teacherForm.teacherCode,
        password: teacherForm.password,
      });
    }

    else {
      const errs = validateAdmin();
      if (Object.keys(errs).length) return setErrors(errs);

      await loginAdmin({
        email: adminForm.email,
        password: adminForm.password,
      });

      navigate('/admin-dashboard');
    }

  } catch (error) {
    setErrors({ submit: error.message || 'Login failed' });
  } finally {
    setIsSubmitting(false);
  }
};

// MFA
const handleMfaSubmit = async (e) => {
  e.preventDefault();

  if (!mfaInput.trim()) {
    setErrors({ mfa: 'Enter 6-digit code' });
    return;
  }

  try {
    setIsSubmitting(true);
    await verifyMfa(mfaInput.trim());
    navigate('/teacher-dashboard');
  } catch (error) {
    setErrors({ mfa: error.message || 'Invalid code' });
  } finally {
    setIsSubmitting(false);
  }
};