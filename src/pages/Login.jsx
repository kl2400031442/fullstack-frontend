import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { loginStudent, loginTeacher, verifyMfa, mfaPending, mfaCode } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [studentForm, setStudentForm] = useState({ nameOrId: '', password: '' });
  const [teacherForm, setTeacherForm] = useState({ teacherCode: '', password: '' });
  const [mfaInput, setMfaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStudent = () => {
    const errs = {};
    const val = studentForm.nameOrId.trim();
    if (!val) errs.nameOrId = 'Name or Student ID is required';
    if (!studentForm.password) errs.password = 'Password is required';
    else if (studentForm.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const validateTeacher = () => {
    const errs = {};
    if (!teacherForm.teacherCode) errs.teacherCode = 'Teacher Code is required';
    else if (!/^\d{4}$/.test(teacherForm.teacherCode)) errs.teacherCode = 'Must be a 4-digit code';
    if (!teacherForm.password) errs.password = 'Password is required';
    else if (teacherForm.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'student') {
      const errs = validateStudent();
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }

      try {
        setIsSubmitting(true);
        const val = studentForm.nameOrId.trim();
        const isId = /^\d{10}$/.test(val);
        await loginStudent({
          name: isId ? '' : val,
          studentId: isId ? val : '',
          password: studentForm.password,
        });
        navigate('/student-dashboard');
      } catch (error) {
        setErrors({ submit: error.message || 'Login failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const errs = validateTeacher();
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }

      try {
        setIsSubmitting(true);
        await loginTeacher({
          teacherCode: teacherForm.teacherCode,
          password: teacherForm.password,
        });
      } catch (error) {
        setErrors({ submit: error.message || 'Login failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaInput.trim()) {
      setErrors({ mfa: 'Please enter the 6-digit code' });
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyMfa(mfaInput.trim());
      navigate('/teacher-dashboard');
    } catch (error) {
      setErrors({ mfa: error.message || 'Invalid MFA code. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (formType, field, value) => {
    if (formType === 'student') setStudentForm((p) => ({ ...p, [field]: value }));
    else setTeacherForm((p) => ({ ...p, [field]: value }));
    if (errors[field] || errors.submit) setErrors((p) => ({ ...p, [field]: '', submit: '' }));
  };

  if (mfaPending) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo-static">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#mlg)" />
                  <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <defs><linearGradient id="mlg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#4f46e5" /></linearGradient></defs>
                </svg>
                <span>PeerCollab</span>
              </div>
              <div className="mfa-icon">🔐</div>
              <h2>Two-Factor Authentication</h2>
              <p>
                Enter the 6-digit verification code from your authenticator workflow.
                {mfaCode ? <><br /><strong>Dev code: {mfaCode}</strong></> : null}
              </p>
            </div>
            <form className="auth-form" onSubmit={handleMfaSubmit}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input
                  className={`form-input mfa-input ${errors.mfa ? 'error' : ''}`}
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={mfaInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setMfaInput(v);
                    if (errors.mfa) setErrors((p) => ({ ...p, mfa: '' }));
                  }}
                  autoFocus
                />
                {errors.mfa && <span className="form-error">{errors.mfa}</span>}
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#alg)" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="alg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#4f46e5" /></linearGradient></defs>
              </svg>
              <span>PeerCollab</span>
            </Link>
            <h2>Welcome Back</h2>
            <p>Select your role and log in</p>
          </div>

          <div className="auth-role-picker" style={{ marginBottom: 'var(--space-6)' }}>
            <button
              type="button"
              className={`auth-role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => {
                setRole('student');
                setErrors({});
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={`auth-role-btn ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => {
                setRole('teacher');
                setErrors({});
              }}
            >
              👩‍🏫 Teacher
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {role === 'student' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Name or Student ID (10 digits)</label>
                  <input
                    className={`form-input ${errors.nameOrId ? 'error' : ''}`}
                    type="text"
                    placeholder="Enter your name or 10-digit ID"
                    value={studentForm.nameOrId}
                    onChange={(e) => handleChange('student', 'nameOrId', e.target.value)}
                  />
                  {errors.nameOrId && <span className="form-error">{errors.nameOrId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    type="password"
                    placeholder="Enter your password"
                    value={studentForm.password}
                    onChange={(e) => handleChange('student', 'password', e.target.value)}
                  />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Teacher Code (4 digits)</label>
                  <input
                    className={`form-input ${errors.teacherCode ? 'error' : ''}`}
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={teacherForm.teacherCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handleChange('teacher', 'teacherCode', v);
                    }}
                  />
                  {errors.teacherCode && <span className="form-error">{errors.teacherCode}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    type="password"
                    placeholder="Enter your password"
                    value={teacherForm.password}
                    onChange={(e) => handleChange('teacher', 'password', e.target.value)}
                  />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>
              </>
            )}

            {errors.submit && <span className="form-error">{errors.submit}</span>}

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : role === 'student' ? 'Log In' : 'Verify & Get MFA Code'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
