import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowRight, Shield, Zap, Users, Layout as LayoutIcon } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: LayoutIcon, title: 'Intuitive Dashboard', desc: 'Real-time overview of all your team tasks and project progress.' },
    { icon: Users, title: 'Team Collaboration', desc: 'Assign tasks to teams or individuals and stay in sync effortlessly.' },
    { icon: Zap, title: 'Rapid Execution', desc: 'Streamlined workflows designed for high-performance teams.' },
    { icon: Shield, title: 'Role-Based Security', desc: 'Secure access control for admins and members alike.' },
  ];

  return (
    <div className="auth-page" style={{ flexDirection: 'column', overflowY: 'auto', display: 'block' }}>
      {/* Navbar */}
      <nav className="navbar glass-panel" style={{ position: 'fixed', width: '100%', top: 0, left: 0, zIndex: 1000 }}>
        <div className="navbar-left">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><CheckSquare size={20} color="white" /></div>
            <span className="sidebar-logo-text">TaskFlow</span>
          </div>
        </div>
        <div className="navbar-right">
          <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '160px 24px 100px', 
        textAlign: 'center', 
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="auth-bg-shapes">
          <div className="auth-shape auth-shape-1" style={{ width: '600px', height: '600px', opacity: 0.2 }} />
          <div className="auth-shape auth-shape-2" style={{ width: '400px', height: '400px', opacity: 0.1 }} />
        </div>

        <div className="fade-in-up" style={{ maxWidth: '800px' }}>
          <span className="status-badge status-inprogress" style={{ marginBottom: '24px' }}>Now in Production 🚀</span>
          <h1 style={{ 
            fontSize: 'clamp(40px, 8vw, 72px)', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Manage Team Tasks <br /> with Precision.
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 40px' }}>
            The all-in-one task management platform for modern teams. 
            Assign, track, and complete projects with a sleek, high-performance interface.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => navigate('/signup')}>
              Start for Free <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
            <button className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => navigate('/login')}>
              Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="page-container" style={{ padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>Built for Performance</h2>
          <p style={{ color: 'var(--text-muted)' }}>Everything you need to lead your team to success.</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {features.map((f, i) => (
            <div key={i} className="stat-card" style={{ padding: '32px', textAlign: 'left', animationDelay: `${i * 0.1}s` }}>
              <div className="stat-card-icon stat-icon-blue" style={{ marginBottom: '20px' }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="sidebar-logo" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <div className="sidebar-logo-icon"><CheckSquare size={20} color="white" /></div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} TaskFlow Inc. Built for high-performance teams.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
