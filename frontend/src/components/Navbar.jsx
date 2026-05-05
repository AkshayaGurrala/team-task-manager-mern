import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick} id="menu-toggle">
          <Menu size={22} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="navbar-username">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
