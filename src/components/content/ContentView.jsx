import { useState } from 'react';
import { useMeridian } from '../../context/MeridianContext';
import { format } from 'date-fns';

export const ContentView = () => {
  const { contentPieces, updateContentPiece, deleteContentPiece } = useMeridian();
  const [expandedId, setExpandedId] = useState(null);

  const handleUpdate = (id, field, value) => {
    updateContentPiece(id, { [field]: value });
  };

  const types = ['article', 'linkedin_post', 'book_chapter', 'blog_post'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="page-title">Content Studio</h1>
        <div className="meta-text mt-8">Manage writing and publishing</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {types.map(type => {
          const items = contentPieces.filter(c => c.type === type);
          if (items.length === 0) return null;
          
          return (
            <div key={type}>
              <div className="section-label mb-16">{type.replace('_', ' ')}</div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Title</th>
                      <th>Platform</th>
                      <th>Stage</th>
                      <th>Target Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} style={{ cursor: 'pointer', backgroundColor: expandedId === item.id ? 'var(--surface)' : 'transparent' }} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                        <td style={{ fontWeight: 500 }}>{item.title}</td>
                        <td>{item.platform || '-'}</td>
                        <td><span className="badge badge-content">{item.stage.replace('_', ' ')}</span></td>
                        <td>{item.target_date ? format(new Date(item.target_date), 'MMM do, yyyy') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {items.map(item => expandedId === item.id && (
                <div key={`expand-${item.id}`} className="card mt-8" style={{ borderLeft: '4px solid var(--accent-content)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Title</label><input type="text" className="form-input" value={item.title} onChange={e => handleUpdate(item.id, 'title', e.target.value)} /></div>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Platform</label><input type="text" className="form-input" value={item.platform || ''} onChange={e => handleUpdate(item.id, 'platform', e.target.value)} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Stage</label><select className="form-select" value={item.stage} onChange={e => handleUpdate(item.id, 'stage', e.target.value)}><option value="idea">Idea</option><option value="outline">Outline</option><option value="draft">Draft</option><option value="review">Review</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select></div>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Target Date</label><input type="date" className="form-input" value={item.target_date || ''} onChange={e => handleUpdate(item.id, 'target_date', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" style={{ minHeight: '100px' }} value={item.notes || ''} onChange={e => handleUpdate(item.id, 'notes', e.target.value)} /></div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-primary" style={{ backgroundColor: '#EF4444' }} onClick={(e) => { e.stopPropagation(); deleteContentPiece(item.id); }}>Delete Piece</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
