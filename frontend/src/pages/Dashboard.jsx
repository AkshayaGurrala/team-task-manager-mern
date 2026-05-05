import { useEffect, useState } from 'react';
import { taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-card-body">
      <div>
        <p className="stat-card-label">{label}</p>
        <h2 className="stat-card-value">{value}</h2>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
      <div className={`stat-card-icon stat-icon-${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const statusColor = {
  Pending: 'status-pending',
  'In Progress': 'status-inprogress',
  Completed: 'status-completed',
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await taskAPI.getDashboard();
        setStats(data.stats);
        setMyTasks(data.myTasks);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { icon: ListTodo, label: 'Total Tasks', value: stats?.total ?? 0, color: 'blue', sub: 'All assigned tasks' },
    { icon: CheckCircle2, label: 'Completed', value: stats?.completed ?? 0, color: 'green', sub: 'Done' },
    { icon: TrendingUp, label: 'In Progress', value: stats?.inProgress ?? 0, color: 'purple', sub: 'Active now' },
    { icon: Clock, label: 'Pending', value: stats?.pending ?? 0, color: 'orange', sub: 'Not started' },
    { icon: AlertTriangle, label: 'Overdue', value: stats?.overdue ?? 0, color: 'red', sub: 'Past deadline' },
    { icon: Users, label: 'Total Teams', value: stats?.totalTeams ?? 0, color: 'indigo', sub: 'Active teams' },
  ];

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div>
          <h2 className="dashboard-greeting">
            👋 Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="dashboard-date">
            {format(new Date(), "EEEE, MMMM d, yyyy")} • {isAdmin ? '⚡ Admin View' : '👤 Member View'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => navigate('/tasks')}>
            + New Task
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="dashboard-grid-2">
        {/* My Tasks */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">My Recent Tasks</h3>
            <button className="section-link" onClick={() => navigate('/tasks')}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {myTasks.length === 0 ? (
            <div className="empty-state">
              <ListTodo size={48} />
              <p>No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.map((task) => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';
                return (
                  <div key={task._id} className={`task-list-item ${isOverdue ? 'task-list-overdue' : ''}`}>
                    <div className="task-list-left">
                      <CheckCircle2
                        size={18}
                        className={task.status === 'Completed' ? 'text-green' : 'text-muted'}
                      />
                      <div>
                        <p className="task-list-title">{task.title}</p>
                        <p className="task-list-project">
                          {task.projectId?.title || 'No Project'}
                          {task.team && <span className="team-indicator"> • {task.team.name}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="task-list-right">
                      <span className={`status-badge ${statusColor[task.status]}`}>
                        {task.status}
                      </span>
                      {task.deadline && (
                        <span className={`task-list-date ${isOverdue ? 'text-danger' : ''}`}>
                          {format(new Date(task.deadline), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Per Team (Admin Only) */}
        {isAdmin && (
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Tasks per Team</h3>
              <button className="section-link" onClick={() => navigate('/teams')}>
                View Teams <ArrowRight size={14} />
              </button>
            </div>
            <div className="team-stats-list">
              {stats?.tasksPerTeam?.length > 0 ? (
                stats.tasksPerTeam.map((team) => (
                  <div key={team._id} className="team-stat-item">
                    <span className="team-stat-name">{team.name}</span>
                    <div className="team-stat-bar-container">
                      <div 
                        className="team-stat-bar" 
                        style={{ width: `${stats.total > 0 ? (team.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="team-stat-count">{team.count} tasks</span>
                  </div>
                ))
              ) : (
                <p className="text-muted">No team tasks yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
