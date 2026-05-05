import React from 'react';
import { useNavigate } from 'react-router-dom';

const TeamCard = ({ team, onEdit, onDelete, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <div className="card team-card animate-fadeIn">
      <div className="card-header">
        <div className="team-info" onClick={() => navigate(`/teams/${team._id}`)} style={{ cursor: 'pointer' }}>
          <h3>{team.name}</h3>
          <span className="member-count">{team.members?.length || 0} Members</span>
        </div>
        {isAdmin && (
          <div className="card-actions">
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(team); }} title="Edit Team">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); onDelete(team._id); }} title="Delete Team">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        )}
      </div>
      <div className="card-content" onClick={() => navigate(`/teams/${team._id}`)} style={{ cursor: 'pointer' }}>
        <div className="members-preview">
          {team.members?.slice(0, 5).map((member) => (
            <div key={member._id} className="member-avatar-mini" title={member.name}>
              {member.name?.charAt(0)}
            </div>
          ))}
          {team.members?.length > 5 && (
            <div className="member-avatar-more">+{team.members.length - 5}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;

