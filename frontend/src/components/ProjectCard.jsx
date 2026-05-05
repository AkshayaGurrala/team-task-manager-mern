import { format } from 'date-fns';
import { Users, Calendar, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const statusColor = {
  active: 'proj-status-active',
  completed: 'proj-status-completed',
  'on-hold': 'proj-status-onhold',
};

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';

  return (
    <div className={`project-card ${isOverdue ? 'project-card-overdue' : ''}`}>
      <div className="project-card-header">
        <div className="project-icon-wrap">
          <FolderOpen size={22} />
        </div>
        <div className="project-card-status-wrap">
          <span className={`proj-status-badge ${statusColor[project.status]}`}>{project.status}</span>
          {isAdmin && (
            <div className="project-card-actions">
              <button className="btn-icon btn-icon-edit" onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
                <Edit2 size={13} />
              </button>
              <button className="btn-icon btn-icon-delete" onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}>
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="project-card-title" onClick={() => navigate(`/projects/${project._id}`)}>
        {project.title}
      </h3>
      <p className="project-card-desc">{project.description || 'No description provided.'}</p>

      <div className="project-card-footer">
        <div className="project-meta-item">
          <Users size={14} />
          <span>{project.members?.length || 0} members</span>
        </div>
        {project.deadline && (
          <div className={`project-meta-item ${isOverdue ? 'text-danger' : ''}`}>
            <Calendar size={14} />
            <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
