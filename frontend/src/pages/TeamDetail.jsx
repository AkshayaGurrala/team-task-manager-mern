import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamAPI, projectAPI, taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import ProjectCard from '../components/ProjectCard';
import { ArrowLeft, Users, FolderKanban, ListTodo, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const [teamRes, projRes, taskRes] = await Promise.all([
        teamAPI.getById(id),
        projectAPI.getAll(), // We'll filter these
        taskAPI.getAll({ team: id })
      ]);

      setTeam(teamRes.data.data);
      // Filter projects that have this team assigned
      const teamProjects = projRes.data.projects.filter(p => 
        p.teams?.some(t => (t._id || t) === id)
      );
      setProjects(teamProjects);
      setTasks(taskRes.data.tasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team details:', err);
      toast.error('Failed to load team details');
      navigate('/teams');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!team) return null;

  return (
    <div className="page-container animate-fadeIn">
      <button className="back-btn" onClick={() => navigate('/teams')}>
        <ArrowLeft size={16} /> Back to Teams
      </button>

      <div className="page-header">
        <div className="page-title-area">
          <div className="team-avatar-large">
            <Users size={32} />
          </div>
          <div>
            <h1>{team.name}</h1>
            <p>{team.members?.length || 0} Members • Assigned to {projects.length} Projects</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Members Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Members</h3>
          </div>
          <div className="members-grid">
            {team.members?.map(m => (
              <div key={m._id} className="member-card">
                <div className="member-card-avatar">{m.name.charAt(0)}</div>
                <div className="member-card-info">
                  <p className="member-card-name">{m.name}</p>
                  <p className="member-card-email">{m.email}</p>
                  <span className={`role-badge role-badge-${m.role}`}>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Assigned Projects</h3>
          </div>
          <div className="project-list-compact">
            {projects.length > 0 ? (
              projects.map(p => (
                <div key={p._id} className="project-list-item" onClick={() => navigate(`/projects/${p._id}`)}>
                  <FolderKanban size={18} className="text-accent" />
                  <div className="project-item-info">
                    <span className="project-item-title">{p.title}</span>
                    <span className="project-item-status">{p.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">No projects assigned to this team yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Tasks Section */}
      <div className="dashboard-section mt-6">
        <div className="section-header">
          <h3 className="section-title">Team Tasks ({tasks.length})</h3>
        </div>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={48} />
            <p>No tasks assigned to this team yet</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(t => (
              <TaskCard 
                key={t._id} 
                task={t} 
                onStatusChange={async (id, status) => {
                  await taskAPI.update(id, { status });
                  fetchTeamDetails();
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
