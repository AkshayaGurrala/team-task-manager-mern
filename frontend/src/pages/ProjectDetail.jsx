import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Users, Calendar, Plus, UserPlus, UserMinus, X } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getAll({ projectId: id }),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
      if (isAdmin) {
        const { data } = await authAPI.getUsers();
        setUsers(data.users);
      }
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.update(taskId, { status });
      setTasks(t => t.map(x => x._id === taskId ? { ...x, status } : x));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(t => t.filter(x => x._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      await projectAPI.addMember(id, selectedUser);
      toast.success('Member added');
      setShowAddMember(false);
      setSelectedUser('');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectAPI.removeMember(id, userId);
      toast.success('Member removed');
      fetchData();
    } catch { toast.error('Failed to remove member'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!project) return null;

  const nonMembers = users.filter(u => !project.members.some(m => m._id === u._id));

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="project-detail-header">
        <div>
          <h2 className="page-title">{project.title}</h2>
          <p className="page-subtitle">{project.description || 'No description'}</p>
          <div className="project-detail-meta">
            {project.deadline && (
              <span className="meta-chip"><Calendar size={13} />{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
            )}
            <span className="meta-chip"><Users size={13} />{project.members.length} members</span>
            <span className={`proj-status-badge proj-status-${project.status}`}>{project.status}</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Assigned Teams</h3>
        </div>
        {project.teams?.length > 0 ? (
          <div className="teams-grid">
            {project.teams.map(t => (
              <div key={t._id} className="team-card">
                <h4 className="team-card-name">{t.name}</h4>
                <p className="team-card-count">{t.members?.length || 0} Members</p>
                <div className="team-member-avatars">
                  {t.members?.slice(0, 5).map(m => (
                    <div key={m._id} className="avatar-stack" title={m.name}>{m.name?.charAt(0)}</div>
                  ))}
                  {t.members?.length > 5 && <div className="avatar-stack">+{t.members.length - 5}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No teams assigned to this project</p>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Individual Members</h3>
          {isAdmin && (
            <button className="btn-outline" onClick={() => setShowAddMember(true)}>
              <UserPlus size={14} /> Add Member
            </button>
          )}
        </div>
        <div className="members-grid">
          {project.members.map(m => (
            <div key={m._id} className="member-card">
              <div className="member-card-avatar">{m.name.charAt(0)}</div>
              <div className="member-card-info">
                <p className="member-card-name">{m.name}</p>
                <p className="member-card-email">{m.email}</p>
                <span className={`role-badge role-badge-${m.role}`}>{m.role}</span>
              </div>
              {isAdmin && (
                <button className="btn-icon btn-icon-delete" onClick={() => handleRemoveMember(m._id)}>
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {/* ... rest of the member addition logic ... */}


        {showAddMember && (
          <div className="inline-add-member">
            <select className="form-input form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">Select user to add</option>
              {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <button className="btn-primary" onClick={handleAddMember}>Add</button>
            <button className="btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Tasks ({tasks.length})</h3>
          {isAdmin && (
            <button className="btn-primary" onClick={() => navigate('/tasks')}>
              <Plus size={14} /> Add Task
            </button>
          )}
        </div>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks for this project yet</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(t => (
              <TaskCard
                key={t._id}
                task={t}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onEdit={() => navigate('/tasks')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
