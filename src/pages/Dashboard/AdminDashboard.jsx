import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createTask } from '../../services/lmsService';
import './Dashboard.css';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxTeamSize: 1,
    assignedStudentIds: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const assignedStudentIds = form.assignedStudentIds
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Boolean);

      await createTask(
        {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          maxTeamSize: Number(form.maxTeamSize),
          status: 'pending',
          assignedStudentIds,
        },
        token,
      );

      setMessage('Task created and assigned successfully.');
      setForm({ title: '', description: '', dueDate: '', maxTeamSize: 1, assignedStudentIds: '' });
    } catch (submitError) {
      setError(submitError.message || 'Failed to create task');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h2>Welcome, {user?.name || 'Admin'}! 🛠️</h2>
          <p>Create projects/tasks and assign them to specific students.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '760px' }}>
        <h3 className="section-title">Create & Assign Task</h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Team Size</label>
              <input type="number" min="1" max="10" className="form-input" value={form.maxTeamSize} onChange={(e) => setForm((p) => ({ ...p, maxTeamSize: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign Student IDs (comma-separated user IDs)</label>
            <input
              className="form-input"
              placeholder="e.g. 3, 8, 12"
              value={form.assignedStudentIds}
              onChange={(e) => setForm((p) => ({ ...p, assignedStudentIds: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" type="submit">Create Task</button>
          {message && <p style={{ color: 'var(--success)', marginTop: '8px' }}>{message}</p>}
          {error && <p style={{ color: 'var(--danger)', marginTop: '8px' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
