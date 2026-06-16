import { useState } from 'react';
import { useMeridian } from '../../context/MeridianContext';
import { format } from 'date-fns';
import { IconX } from '../ui/Icons';

const stages = ['applied', 'shortlisted', 'interview_r1', 'interview_r2', 'offer', 'closed'];
const stageLabels = { 'applied': 'Applied', 'shortlisted': 'Shortlisted', 'interview_r1': 'Interview R1', 'interview_r2': 'Interview R2', 'offer': 'Offer', 'closed': 'Closed' };

export const PipelineView = () => {
  const { pipelineItems, updatePipelineItem, deletePipelineItem } = useMeridian();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleUpdate = (field, value) => {
    if (!selectedItem) return;
    const updated = { ...selectedItem, [field]: value };
    setSelectedItem(updated);
    updatePipelineItem(updated.id, { [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
      <div>
        <h1 className="page-title">Pipeline</h1>
        <div className="meta-text mt-8">Track applications and opportunities</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', flex: 1 }}>
        {stages.map(stage => {
          const items = pipelineItems.filter(p => p.stage === stage);
          return (
            <div key={stage} style={{ minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{stageLabels[stage]}</span>
                <span>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map(item => (
                  <div key={item.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedItem(item)}>
                    <div className="body-text" style={{ fontWeight: 'bold' }}>{item.company}</div>
                    <div className="meta-text mt-8">{item.role}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <span className="badge badge-pipeline">{item.type.replace('_', ' ')}</span>
                      {item.next_action_date && <span className="meta-text">{format(new Date(item.next_action_date), 'MMM do')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div style={{ position: 'fixed', right: 0, top: 0, width: '350px', height: '100vh', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 50, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="page-title" style={{ fontSize: '18px' }}>Edit Item</h2>
            <button className="btn-close" onClick={() => setSelectedItem(null)}><IconX /></button>
          </div>
          
          <div className="form-group"><label className="form-label">Company</label><input type="text" className="form-input" value={selectedItem.company || ''} onChange={e => handleUpdate('company', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Role</label><input type="text" className="form-input" value={selectedItem.role || ''} onChange={e => handleUpdate('role', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Stage</label><select className="form-select" value={selectedItem.stage} onChange={e => handleUpdate('stage', e.target.value)}>{stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={selectedItem.type} onChange={e => handleUpdate('type', e.target.value)}><option value="internship">Internship</option><option value="placement">Placement</option><option value="case_competition">Case Competition</option></select></div>
          <div className="form-group"><label className="form-label">Next Action</label><input type="text" className="form-input" value={selectedItem.next_action || ''} onChange={e => handleUpdate('next_action', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Action Date</label><input type="date" className="form-input" value={selectedItem.next_action_date || ''} onChange={e => handleUpdate('next_action_date', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" style={{ minHeight: '100px' }} value={selectedItem.notes || ''} onChange={e => handleUpdate('notes', e.target.value)} /></div>
          
          <button className="btn-primary mt-16" style={{ backgroundColor: '#EF4444' }} onClick={() => { deletePipelineItem(selectedItem.id); setSelectedItem(null); }}>Delete Item</button>
        </div>
      )}
    </div>
  );
};
