import { useEffect, useState } from 'react';
import { projectAPI, authAPI, teamAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';
import { Plus, X, FolderKanban, Users } from 'lucide-react';

const emptyForm = { title: '', description: '', deadline: '', members: [], teams: [], status: 'active' };

const ProjectModal = ({ project, users, teams, onClose, onSave }) => {
  const [form, setForm] = useState(project ? {
    title: project.title,
    description: project.description,
    deadline: project.deadline ? project.deadline.slice(0, 10) : '',
    members: project.members.map(m => m._id || m),
    teams: project.teams ? project.teams.map(t => t._id || t) : [],
    status: project.status,
  } : { ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('members');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (userId) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter(id => id !== userId)
        : [...f.members, userId],
    }));
  };

  const toggleTeam = (teamId) => {
    setForm(f => ({
      ...f,
      teams: f.teams.includes(teamId)
        ? f.teams.filter(id => id !== teamId)
        : [...f.teams, teamId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{project ? 'Edit Project' : 'New Project'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="Enter title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input form-textarea" value={form.description} onChange={handleChange} placeholder="Project description..." rows={2} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input name="deadline" type="date" className="form-input" value={form.deadline} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input form-select" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="modal-tabs">
            <button type="button" className={`modal-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Individual Members</button>
            <button type="button" className={`modal-tab ${tab === 'teams' ? 'active' : ''}`} onClick={() => setTab('teams')}>Teams</button>
          </div>

          <div className="selection-area">
            {tab === 'members' ? (
              <div className="member-list scrollable">
                {users.map(u => (
                  <label key={u._id} className={`member-item ${form.members.includes(u._id) ? 'member-item-selected' : ''}`}>
                    <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} className="member-checkbox" />
                    <span className="member-avatar">{u.name.charAt(0)}</span>
                    <div className="member-info">
                      <span className="member-name">{u.name}</span>
                      <span className="member-email">{u.email}</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="team-selection-list scrollable">
                {teams.map(t => (
                  <label key={t._id} className={`member-item ${form.teams.includes(t._id) ? 'member-item-selected' : ''}`}>
                    <input type="checkbox" checked={form.teams.includes(t._id)} onChange={() => toggleTeam(t._id)} className="member-checkbox" />
                    <span className="member-avatar team-avatar"><Users size={14} /></span>
                    <div className="member-info">
                      <span className="member-name">{t.name}</span>
                      <span className="member-email">{t.members?.length || 0} Members</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : (project ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data.projects);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaticData = async () => {
    if (!isAdmin) return;
    try {
      const [uRes, tRes] = await Promise.all([authAPI.getUsers(), teamAPI.getAll()]);
      setUsers(uRes.data.users);
      setTeams(tRes.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchProjects();
    fetchStaticData();
  }, [isAdmin]);

  const handleSave = async (form) => {
    try {
      if (editProject) {
        await projectAPI.update(editProject._id, form);
        toast.success('Project updated!');
      } else {
        await projectAPI.create(form);
        toast.success('Project created!');
      }
      setShowModal(false);
      setEditProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      setProjects(p => p.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setShowModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} />
          <p>No projects found</p>
          {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}>Create First Project</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          users={users}
          teams={teams}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Projects;

