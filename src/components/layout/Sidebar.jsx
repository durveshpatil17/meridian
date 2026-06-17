import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconDashboard, IconAcademics, IconPipeline, IconContent, IconSettings, IconSun, IconMoon, IconInbox } from '../ui/Icons';

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('meridian_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meridian_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navItems = [
    { path: '/', icon: <IconDashboard />, title: 'Dashboard' },
    { path: '/academics', icon: <IconAcademics />, title: 'Academics' },
    { path: '/pipeline', icon: <IconPipeline />, title: 'Pipeline' },
    { path: '/content', icon: <IconContent />, title: 'Content' },
    { path: '/inbox', icon: <IconInbox />, title: 'Inbox' },
    { path: '/settings', icon: <IconSettings />, title: 'Settings' }
  ];

  return (
    <div style={{ width: 'var(--sidebar-width)', height: '100vh', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', backgroundColor: 'var(--bg)', position: 'fixed', left: 0, top: 0, zIndex: 10 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent-ai)' : '2px solid transparent',
              padding: '8px',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer'
            })}
            title={item.title}
          >
            {item.icon}
          </NavLink>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </div>
        <div 
          onClick={signOut}
          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-ai)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          title={`Sign out (${user?.email})`}
        >
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
};
