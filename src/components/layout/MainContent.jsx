import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AIPanel } from '../ai/AIPanel';
import { QuickAddModal } from '../ui/QuickAddModal';
import { IconPlus } from '../ui/Icons';

export const MainContent = () => {
  const location = useLocation();
  const showAIPanel = location.pathname === '/';
  const showQuickAddBtn = location.pathname !== '/settings';
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Map route to engine for initial QuickAdd selection
  const engineMap = {
    '/': 'Academics',
    '/academics': 'Academics',
    '/pipeline': 'Pipeline',
    '/content': 'Content'
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: 'var(--sidebar-width)', 
        marginRight: showAIPanel ? 'var(--ai-panel-width)' : '0',
        padding: '32px 48px',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <Outlet />
      </div>
      
      {showQuickAddBtn && (
        <button 
          className="btn-primary" 
          style={{ 
            position: 'fixed', 
            bottom: '32px', 
            right: showAIPanel ? `calc(var(--ai-panel-width) + 32px)` : '32px',
            width: '48px', height: '48px', borderRadius: '50%', padding: 0, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100
          }} 
          onClick={() => setShowQuickAdd(true)}
        >
          <IconPlus />
        </button>
      )}

      {showQuickAdd && (
        <QuickAddModal 
          onClose={() => setShowQuickAdd(false)} 
          initialEngine={engineMap[location.pathname] || 'Academics'} 
        />
      )}

      {showAIPanel && <AIPanel />}
    </div>
  );
};
