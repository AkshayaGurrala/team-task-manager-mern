import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, User, Users, Trash2, Edit2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  Pending: { color: 'status-pending', icon: Circle },
  'In Progress': { color: 'status-inprogress', icon: AlertCircle },
  Completed: { color: 'status-completed', icon: CheckCircle },
};

const priorityConfig = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
};

const TaskCard = ({ task, onStatusChange, onDelete, onEdit }) => {
  const { isAdmin } = useAuth();
  const [updating, setUpdating] = useState(false);

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';
  const StatusIcon = statusConfig[task.status]?.icon || Circle;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setUpdating(true);
    await onStatusChange(task._id, newStatus);
    setUpdating(false);
  };

  return (
    <div className={`task-card ${isOverdue ? 'task-card-overdue' : ''}`}>
      {/* Header */}
      <div className="task-card-header">
        <div className="task-card-meta">
          <span className={`priority-badge ${priorityConfig[task.priority]}`}>{task.priority}</span>
          {isOverdue && <span className="overdue-badge">⚠ Overdue</span>}
        </div>
        {isAdmin && (
          <div className="task-card-actions">
            <button className="btn-icon btn-icon-edit" onClick={() => onEdit(task)} title="Edit">
              <Edit2 size={14} />
            </button>
            <button className="btn-icon btn-icon-delete" onClick={() => onDelete(task._id)} title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="task-card-title">{task.title}</h3>
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      {/* Project */}
      {task.projectId && (
        <span className="task-project-tag">📁 {task.projectId.title}</span>
      )}

      {/* Footer */}
      <div className="task-card-footer">
        <div className="task-card-info">
          <div className="task-info-item">
            {task.team ? (
              <>
                <Users size={13} />
                <span>{task.team.name} (Team)</span>
              </>
            ) : (
              <>
                <User size={13} />
                <span>{task.assignedTo?.name || 'Unassigned'}</span>
              </>
            )}
          </div>
          {task.deadline && (
            <div className={`task-info-item ${isOverdue ? 'text-danger' : ''}`}>
              <Clock size={13} />
              <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Status Selector */}
        <select
          className={`status-select ${statusConfig[task.status]?.color}`}
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;
