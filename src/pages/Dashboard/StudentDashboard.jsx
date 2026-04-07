import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCompletedCourses, fetchMyTasks, uploadSubmission } from '../../services/lmsService';
import './Dashboard.css';

const statusClass = {
  Pending: 'badge-warning',
  Submitted: 'badge-info',
  Reviewed: 'badge-primary',
  Completed: 'badge-success',
};

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [taskResponse, completedResponse] = await Promise.all([
          fetchMyTasks(token),
          fetchCompletedCourses(token),
        ]);
        setTasks(taskResponse.projects || []);
        setCompletedCourses(completedResponse.completedCourses || []);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load student dashboard data.');
      }
    }
    load();
  }, [token]);

  const handleUpload = async (taskId, file) => {
    if (!file) return;
    try {
      setUploadingId(taskId);
      await uploadSubmission({ projectId: taskId, fileUrl: file.name }, token);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: 'Submitted' } : task)));
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h2>Welcome, {user?.name || 'Student'}! 👋</h2>
          <p>Your personalized LMS dashboard.</p>
        </div>
      </div>

      {error && <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>}

      <div className="dashboard-section card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 className="section-title">My Assigned Tasks</h3>
        <div className="assignment-list">
          {tasks.map((task) => (
            <div key={task.id} className="assignment-item card">
              <div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p>Due: {task.dueDate || 'TBD'}</p>
                <span className={`badge ${statusClass[task.status] || 'badge-warning'}`}>{task.status || 'Pending'}</span>
              </div>
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                {uploadingId === task.id ? 'Uploading...' : 'Upload File'}
                <input
                  type="file"
                  style={{ display: 'none' }}
                  disabled={uploadingId === task.id}
                  onChange={(e) => handleUpload(task.id, e.target.files?.[0])}
                />
              </label>
            </div>
          ))}
          {tasks.length === 0 && <p>No assigned tasks yet.</p>}
        </div>
      </div>

      <div className="dashboard-section card">
        <h3 className="section-title">Completed Courses</h3>
        {completedCourses.length === 0 ? (
          <p>No completed courses yet.</p>
        ) : (
          <ul>
            {completedCourses.map((course) => (
              <li key={course.id}>
                ✅ {course.title} — {new Date(course.completed_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
