import { mockProjects } from '../data/mockProjects';
import { apiRequest } from './apiClient';

const colorPalette = [
  'linear-gradient(135deg, #6366f1, #4f46e5)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
];

function normalizeProject(project, index = 0) {
  return {
    id: project.id || Date.now() + index,
    title: project.title || 'Untitled Project',
    description: project.description || 'No description provided.',
    status: project.status || 'pending',
    dueDate: project.dueDate || project.due_date || 'TBD',
    submissions: project.submissions ?? 0,
    progress: project.progress ?? 0,
    icon: project.icon || '📁',
    color: project.color || colorPalette[index % colorPalette.length],
    team: project.team || [],
  };
}

export async function getProjects(token) {
  try {
    const response = await apiRequest('/projects', { token });
    const rawProjects = Array.isArray(response) ? response : response?.projects;

    if (!Array.isArray(rawProjects)) {
      throw new Error('Invalid projects payload from backend');
    }

    return { projects: rawProjects.map(normalizeProject), isFallback: false };
  } catch (error) {
    return { projects: mockProjects, isFallback: true, error: error.message };
  }
}

export async function createProject(payload, token) {
  const response = await apiRequest('/projects', {
    method: 'POST',
    body: payload,
    token,
  });

  return normalizeProject(response?.project || response || payload);
}
