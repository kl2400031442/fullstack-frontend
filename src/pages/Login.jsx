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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);
      if (role === 'student') {
        const val = studentForm.nameOrId.trim();
        const isId = /^\d{10}$/.test(val);
        await loginStudent({ name: isId ? '' : val, studentId: isId ? val : '', password: studentForm.password });
        navigate('/student-dashboard');
      } else if (role === 'teacher') {
        await loginTeacher({ teacherCode: teacherForm.teacherCode, password: teacherForm.password });
      } else {
        await loginAdmin({ email: adminForm.email.trim(), password: adminForm.password });
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await verifyMfa(mfaInput.trim());
      navigate('/teacher-dashboard');
    } catch (error) {
      setErrors({ mfa: error.message || 'MFA verification failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mfaPending) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Two-Factor Authentication</h2>
              <p>Enter the 6-digit verification code. {mfaCode ? `Dev code: ${mfaCode}` : ''}</p>
            </div>
            <form className="auth-form" onSubmit={handleMfaSubmit}>
              <input className="form-input" value={mfaInput} onChange={(e) => setMfaInput(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              {errors.mfa && <span className="form-error">{errors.mfa}</span>}
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Verifying...' : 'Verify'}</button>
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
            <Link to="/" className="auth-logo"><span>PeerCollab</span></Link>
            <h2>Welcome Back</h2>
          </div>

          <div className="auth-role-picker" style={{ marginBottom: 'var(--space-6)' }}>
            <button type="button" className={`auth-role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>🎓 Student</button>
            <button type="button" className={`auth-role-btn ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>👩‍🏫 Teacher</button>
            <button type="button" className={`auth-role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>🛠️ Admin</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {role === 'student' && (
              <>
                <input className="form-input" placeholder="Name or 10-digit Student ID" value={studentForm.nameOrId} onChange={(e) => setStudentForm((p) => ({ ...p, nameOrId: e.target.value }))} />
                <input className="form-input" type="password" placeholder="Password" value={studentForm.password} onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))} />
              </>
            )}
            {role === 'teacher' && (
              <>
                <input className="form-input" placeholder="Teacher Code" value={teacherForm.teacherCode} onChange={(e) => setTeacherForm((p) => ({ ...p, teacherCode: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                <input className="form-input" type="password" placeholder="Password" value={teacherForm.password} onChange={(e) => setTeacherForm((p) => ({ ...p, password: e.target.value }))} />
              </>
            )}
            {role === 'admin' && (
              <>
                <input className="form-input" type="email" placeholder="Admin Email" value={adminForm.email} onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))} />
                <input className="form-input" type="password" placeholder="Password" value={adminForm.password} onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))} />
              </>
            )}

            {errors.submit && <span className="form-error">{errors.submit}</span>}
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Log In'}</button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
