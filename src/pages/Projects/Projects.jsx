import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import SubmissionUpload from '../../components/SubmissionUpload/SubmissionUpload';
import { createProject, getProjects } from '../../services/projectsService';
import './Projects.css';

export default function Projects() {
  const { isTeacher, token } = useAuth();
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', dueDate: '', maxTeamSize: '' });
  const [createErrors, setCreateErrors] = useState({});

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFallbackData, setIsFallbackData] = useState(false);

  const statuses = ['all', 'active', 'pending', 'completed', 'overdue'];

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      const response = await getProjects(token);
      setProjects(response.projects);
      setIsFallbackData(response.isFallback);
      setError(response.error || '');
      setIsLoading(false);
    }

    loadProjects();
  }, [token]);

  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.status === filter)),
    [filter, projects],
  );

  const handleProjectView = (project) => {
    if (!isTeacher) setShowUpload(project);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!createForm.title.trim()) errs.title = 'Title is required';
    if (!createForm.description.trim()) errs.description = 'Description is required';
    if (!createForm.dueDate) errs.dueDate = 'Due date is required';

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }

    try {
      setCreateErrors({});
      const newProject = await createProject(
        {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          dueDate: createForm.dueDate,
          maxTeamSize: Number(createForm.maxTeamSize) || undefined,
          status: 'pending',
        },
        token,
      );

      setProjects((prev) => [newProject, ...prev]);
      setShowCreate(false);
      setCreateForm({ title: '', description: '', dueDate: '', maxTeamSize: '' });
    } catch (createError) {
      setCreateErrors({ submit: createError.message || 'Failed to create assignment.' });
    }
  };

  return (
    <div className="projects-page">
      <div className="section-header">
        <div>
          <h2 className="section-title">{isTeacher ? 'All Projects' : 'My Projects'}</h2>
          <p className="section-subtitle">{isTeacher ? 'Manage assignments and track submissions' : 'View and submit your work'}</p>
        </div>
        {isTeacher && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Assignment
          </button>
        )}
      </div>

      {isFallbackData && (
        <div className="card" style={{ marginBottom: 'var(--space-4)', color: 'var(--warning)' }}>
          Backend is unreachable. Showing demo data.
          {error ? ` (${error})` : ''}
        </div>
      )}

      <div className="filter-tabs">
        {statuses.map((s) => (
          <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="filter-count">{s === 'all' ? projects.length : projects.filter((p) => p.status === s).length}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card">Loading projects...</div>
      ) : (
        <div className="projects-grid-page">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} isTeacher={isTeacher} onView={handleProjectView} />
          ))}
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SubmissionUpload
              projectTitle={showUpload.title}
              onSubmit={() => setShowUpload(null)}
              onCancel={() => setShowUpload(null)}
            />
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form className="create-assignment-form card" onSubmit={handleCreateSubmit}>
              <h3>📋 Create New Assignment</h3>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  className={`form-input ${createErrors.title ? 'error' : ''}`}
                  placeholder="Enter project title"
                  value={createForm.title}
                  onChange={(e) => {
                    setCreateForm((f) => ({ ...f, title: e.target.value }));
                    setCreateErrors((er) => ({ ...er, title: '', submit: '' }));
                  }}
                />
                {createErrors.title && <span className="form-error">{createErrors.title}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className={`form-textarea ${createErrors.description ? 'error' : ''}`}
                  placeholder="Describe the assignment..."
                  value={createForm.description}
                  onChange={(e) => {
                    setCreateForm((f) => ({ ...f, description: e.target.value }));
                    setCreateErrors((er) => ({ ...er, description: '', submit: '' }));
                  }}
                  rows={4}
                />
                {createErrors.description && <span className="form-error">{createErrors.description}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className={`form-input ${createErrors.dueDate ? 'error' : ''}`}
                    value={createForm.dueDate}
                    onChange={(e) => {
                      setCreateForm((f) => ({ ...f, dueDate: e.target.value }));
                      setCreateErrors((er) => ({ ...er, dueDate: '', submit: '' }));
                    }}
                  />
                  {createErrors.dueDate && <span className="form-error">{createErrors.dueDate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Max Team Size</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 4"
                    min="1"
                    max="10"
                    value={createForm.maxTeamSize}
                    onChange={(e) => setCreateForm((f) => ({ ...f, maxTeamSize: e.target.value }))}
                  />
                </div>
              </div>
              {createErrors.submit && <span className="form-error">{createErrors.submit}</span>}
              <div className="review-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
