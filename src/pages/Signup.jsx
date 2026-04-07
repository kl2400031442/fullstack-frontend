import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      setSubmitError('');
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate(form.role === 'teacher' ? '/teacher-dashboard' : form.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    } catch (error) {
      setSubmitError(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#slg)" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="slg" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <span>PeerCollab</span>
            </Link>
            <h2>Create Your Account</h2>
            <p>Start collaborating with your peers today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">I am a</label>
              <div className="auth-role-picker">
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'student' ? 'active' : ''}`}
                  onClick={() => handleChange('role', 'student')}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'teacher' ? 'active' : ''}`}
                  onClick={() => handleChange('role', 'teacher')}
                >
                  👩‍🏫 Teacher
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'admin' ? 'active' : ''}`}
                  onClick={() => handleChange('role', 'admin')}
                >
                  🛠️ Admin
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            {submitError && <span className="form-error">{submitError}</span>}

            <button type="submit" className="auth-submit-btn">
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}