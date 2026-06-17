import { useAuth } from '../../context/AuthContext';
import { useMeridian } from '../../context/MeridianContext';
import { format } from 'date-fns';

import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { deliverablesDueThisWeek, activePipelineCount, contentInDraftCount, awaitingReviewCount, thisWeekItems } = useMeridian();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="page-title">{getGreeting()}, {user?.email?.split('@')[0] || 'User'}</h1>
        <div className="meta-text mt-8">{format(new Date(), 'EEEE, MMMM do, yyyy')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="card">
          <div className="section-label mb-8">Due This Week</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{deliverablesDueThisWeek.length}</div>
        </div>
        <div className="card">
          <div className="section-label mb-8">Active Pipeline</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{activePipelineCount}</div>
        </div>
        <div className="card">
          <div className="section-label mb-8">Content in Draft</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{contentInDraftCount}</div>
        </div>
      </div>

      {awaitingReviewCount > 0 && (
        <Link to="/inbox" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="body-text" style={{ color: '#d97706', fontWeight: 600 }}>{awaitingReviewCount} documents awaiting review</span>
            <span style={{ color: '#d97706' }}>→</span>
          </div>
        </Link>
      )}

      <div>
        <div className="section-label mb-16">This Week</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {thisWeekItems.length === 0 ? (
            <div className="meta-text">No items due or actionable this week.</div>
          ) : (
            thisWeekItems.map(item => {
              const isOverdue = new Date(item.displayDate) < new Date(new Date().setHours(0,0,0,0));
              return (
                <div key={`${item.engine}-${item.id}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${item.accentClass}` }}>
                  <div>
                    <div className="body-text" style={{ fontWeight: 600 }}>{item.title}</div>
                    <div className="meta-text mt-8" style={{ color: isOverdue ? '#EF4444' : 'inherit' }}>
                      {format(new Date(item.displayDate), 'MMM do')} • {item.engine}
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: `${item.accentClass}26`, color: item.accentClass }}>
                    {item.badgeText}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
