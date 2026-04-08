import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherSubmissions, reviewSubmission } from '../../services/lmsService';
import './Dashboard.css';

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [reviewComment, setReviewComment] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchTeacherSubmissions(token);
        setSubmissions(response.submissions || []);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load submissions');
      }
    }
    load();
  }, [token]);

  const handleReview = async (submissionId) => {
    try {
      await reviewSubmission(submissionId, { reviewComment: reviewComment[submissionId] || '' }, token);
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status: 'Completed', review_comment: reviewComment[submissionId] || '' } : s)));
    } catch (reviewError) {
      setError(reviewError.message || 'Failed to review submission');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome teacher-welcome">
        <div className="welcome-content">
          <h2>Welcome, {user?.name || 'Teacher'}! 👩‍🏫</h2>
          <p>Review student submissions and mark tasks complete.</p>
        </div>
      </div>

      {error && <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>}

      <div className="dashboard-section card">
        <h3 className="section-title">All Student Submissions</h3>
        <div className="assignment-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="assignment-item card">
              <div>
                <h4>{submission.project_title}</h4>
                <p>Student: {submission.student_name}</p>
                <p>File: <a href={submission.file_url} target="_blank" rel="noreferrer">{submission.file_url}</a></p>
                <span className={`badge ${submission.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{submission.status}</span>
              </div>
              <div style={{ minWidth: '280px' }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Add review comments..."
                  value={reviewComment[submission.id] || ''}
                  onChange={(e) => setReviewComment((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                />
                <button className="btn btn-primary btn-sm" onClick={() => handleReview(submission.id)}>
                  Mark Reviewed → Completed
                </button>
              </div>
            </div>
          ))}
          {submissions.length === 0 && <p>No submissions available.</p>}
        </div>
      </div>
    </div>
  );
}
