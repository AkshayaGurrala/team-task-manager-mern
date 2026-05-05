import { useEffect, useState } from 'react';
import { taskAPI, projectAPI, authAPI, teamAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';
import { Plus, X, CheckSquare, Filter } from 'lucide-react';

const emptyForm = { title: '', description: '', assignedTo: '', team: '', projectId: '', deadline: '', priority: 'Medium', status: 'Pending' };

const TaskModal = ({ task, projects, users, teams, onClose, onSave }) => {
  const [form, setForm] = useState(task ? {
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo?._id || '',
    team: task.team?._id || '',
    projectId: task.projectId?._id || '',
    deadline: task.deadline ? task.deadline.slice(0, 10) : '',
    priority: task.priority,
    status: task.status,
  } : { ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [assignmentType, setAssignmentType] = useState(task?.team ? 'team' : 'user');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.projectId) {
      toast.error('Title and project are required');
      return;
    }
    if (assignmentType === 'user' && !form.assignedTo) {
      toast.error('Please select a member');
      return;
    }
    if (assignmentType === 'team' && !form.team) {
      toast.error('Please select a team');
      return;
    }

    const payload = { ...form };
    if (assignmentType === 'user') payload.team = null;
    else payload.assignedTo = null;

    setSaving(true);
    await onSave(payload);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input form-textarea" value={form.description} onChange={handleChange} placeholder="Task description..." rows={2} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <div className="assignment-toggle">
              <button 
                type="button" 
                className={`toggle-btn ${assignmentType === 'user' ? 'active' : ''}`}
                onClick={() => setAssignmentType('user')}
              >
                Individual
              </button>
              <button 
                type="button" 
                className={`toggle-btn ${assignmentType === 'team' ? 'active' : ''}`}
                onClick={() => setAssignmentType('team')}
              >
                Team
              </button>
            </div>
          </div>

          <div className="form-row">
            {assignmentType === 'user' ? (
              <div className="form-group">
                <label className="form-label">Member *</label>
                <select name="assignedTo" className="form-input form-select" value={form.assignedTo} onChange={handleChange}>
                  <option value="">Select member</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Team *</label>
                <select name="team" className="form-input form-select" value={form.team} onChange={handleChange}>
                  <option value="">Select team</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select name="projectId" className="form-input form-select" value={form.projectId} onChange={handleChange} required>
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="form-input form-select" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input form-select" value={form.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input name="deadline" type="date" className="form-input" value={form.deadline} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : (task ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (projectFilter) params.projectId = projectFilter;
      const { data } = await taskAPI.getAll(params);
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      fetchTasks();
      const pData = await projectAPI.getAll();
      setProjects(pData.data.projects);
      
      if (isAdmin) {
        const [uData, tData] = await Promise.all([authAPI.getUsers(), teamAPI.getAll()]);
        setUsers(uData.data.users);
        setTeams(tData.data.data);
      }
    };
    fetchAll();
  }, [isAdmin]);

  useEffect(() => { fetchTasks(); }, [filter, projectFilter]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.update(taskId, { status });
      setTasks(t => t.map(x => x._id === taskId ? { ...x, status } : x));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async (form) => {
    try {
      if (editTask) {
        await taskAPI.update(editTask._id, form);
        toast.success('Task updated!');
      } else {
        await taskAPI.create(form);
        toast.success('Task created!');
      }
      setShowModal(false);
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      setTasks(t => t.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const statusFilters = ['', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={16} />
          <span>Filter:</span>
        </div>
        <div className="filter-btns">
          {statusFilters.map(s => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'filter-btn-active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <select
          className="form-input form-select filter-select"
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={48} />
          <p>No tasks found</p>
          {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}>Create First Task</button>}
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(t => (
            <TaskCard
              key={t._id}
              task={t}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={(task) => { setEditTask(task); setShowModal(true); }}
            />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          projects={projects}
          users={users}
          teams={teams}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Tasks;

