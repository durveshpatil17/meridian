import { useState, useEffect } from 'react';
import { useMeridian } from '../../context/MeridianContext';
import { IconX } from './Icons';

export const QuickAddModal = ({ onClose, initialEngine = 'Academics' }) => {
  const { addDeliverable, addPipelineItem, addContentPiece, courses } = useMeridian();
  const [engine, setEngine] = useState(initialEngine);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (engine === 'Academics') setFormData({ title: '', course_id: courses[0]?.id || '', type: 'assignment', due_date: '', weight: '', notes: '' });
    else if (engine === 'Pipeline') setFormData({ company: '', role: '', type: 'internship', next_action: '', next_action_date: '', notes: '' });
    else if (engine === 'Content') setFormData({ title: '', type: 'article', platform: '', target_date: '', word_count: '', notes: '' });
  }, [engine, courses]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (engine === 'Academics') addDeliverable(formData);
    else if (engine === 'Pipeline') addPipelineItem(formData);
    else if (engine === 'Content') addContentPiece(formData);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="page-title" style={{ fontSize: '18px' }}>Quick Add</h2>
          <button className="btn-close" onClick={onClose}><IconX /></button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Engine</label>
          <select className="form-select" value={engine} onChange={(e) => setEngine(e.target.value)}>
            <option value="Academics">Academics</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Content">Content</option>
          </select>
        </div>

        {engine === 'Academics' && (
          <>
            <div className="form-group"><label className="form-label">Title</label><input type="text" className="form-input" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Course</label><select className="form-select" value={formData.course_id || ''} onChange={e => handleChange('course_id', e.target.value)}>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}><option value="assignment">Assignment</option><option value="project">Project</option><option value="presentation">Presentation</option></select></div>
            <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={formData.due_date || ''} onChange={e => handleChange('due_date', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Weight</label><input type="number" className="form-input" value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} /></div>
          </>
        )}

        {engine === 'Pipeline' && (
          <>
            <div className="form-group"><label className="form-label">Company</label><input type="text" className="form-input" value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role</label><input type="text" className="form-input" value={formData.role || ''} onChange={e => handleChange('role', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}><option value="internship">Internship</option><option value="placement">Placement</option><option value="case_competition">Case Competition</option></select></div>
            <div className="form-group"><label className="form-label">Next Action</label><input type="text" className="form-input" value={formData.next_action || ''} onChange={e => handleChange('next_action', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Action Date</label><input type="date" className="form-input" value={formData.next_action_date || ''} onChange={e => handleChange('next_action_date', e.target.value)} /></div>
          </>
        )}

        {engine === 'Content' && (
          <>
            <div className="form-group"><label className="form-label">Title</label><input type="text" className="form-input" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}><option value="article">Article</option><option value="linkedin_post">LinkedIn Post</option></select></div>
            <div className="form-group"><label className="form-label">Platform</label><input type="text" className="form-input" value={formData.platform || ''} onChange={e => handleChange('platform', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Target Date</label><input type="date" className="form-input" value={formData.target_date || ''} onChange={e => handleChange('target_date', e.target.value)} /></div>
          </>
        )}

        <button className="btn-primary mt-16" onClick={handleSubmit}>Save Item</button>
      </div>
    </div>
  );
};
