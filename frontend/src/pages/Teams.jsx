import React, { useState, useEffect } from 'react';
import { teamAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import TeamCard from '../components/TeamCard';
import { Plus, Users, X, UserPlus, Trash2 } from 'lucide-react';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', members: [] });
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTeams();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchTeams = async () => {
    try {
      const { data } = await teamAPI.getAll();
      setTeams(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await authAPI.getUsers();
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTeam) {
        await teamAPI.update(editTeam._id, formData);
      } else {
        await teamAPI.create(formData);
      }
      setShowModal(false);
      setEditTeam(null);
      setFormData({ name: '', members: [] });
      fetchTeams();
    } catch (err) {
      console.error('Error saving team:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamAPI.delete(id);
        fetchTeams();
      } catch (err) {
        console.error('Error deleting team:', err);
      }
    }
  };

  const handleEdit = (team) => {
    setEditTeam(team);
    setFormData({
      name: team.name,
      members: team.members.map(m => m._id || m)
    });
    setShowModal(true);
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div className="page-title-area">
          <Users size={28} className="page-icon" />
          <div>
            <h1>Teams</h1>
            <p>Manage your organization's teams and members</p>
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTeam(null); setFormData({ name: '', members: [] }); setShowModal(true); }}>
            <Plus size={18} />
            <span>Create Team</span>
          </button>
        )}
      </div>

      <div className="teams-grid">
        {teams.length > 0 ? (
          teams.map(team => (
            <TeamCard 
              key={team._id} 
              team={team} 
              isAdmin={isAdmin} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <h3>No teams found</h3>
            <p>Teams help organize members and assign group tasks.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slideUp">
            <div className="modal-header">
              <h2>{editTeam ? 'Edit Team' : 'Create New Team'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Team Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Frontend Developers"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Select Members</label>
                <div className="member-selection-list">
                  {users.map(user => (
                    <div 
                      key={user._id} 
                      className={`member-select-item ${formData.members.includes(user._id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(user._id)}
                    >
                      <div className="member-avatar-mini">{user.name.charAt(0)}</div>
                      <div className="member-select-info">
                        <span className="member-select-name">{user.name}</span>
                        <span className="member-select-email">{user.email}</span>
                      </div>
                      {formData.members.includes(user._id) && <div className="member-check">✓</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTeam ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
