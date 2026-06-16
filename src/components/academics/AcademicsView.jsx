import { useState } from 'react';
import { useMeridian } from '../../context/MeridianContext';
import { format } from 'date-fns';

export const AcademicsView = () => {
  const { courses, deliverables, cycleDeliverableStatus } = useMeridian();
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const filteredDeliverables = selectedCourseId 
    ? deliverables.filter(d => d.course_id === selectedCourseId)
    : deliverables;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="page-title">Academics</h1>
        <div className="meta-text mt-8">Manage courses and deliverables</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div 
          className="card" 
          style={{ cursor: 'pointer', border: selectedCourseId === null ? '1px solid var(--accent-academics)' : '1px solid var(--border)' }}
          onClick={() => setSelectedCourseId(null)}
        >
          <div className="body-text" style={{ fontWeight: 'bold' }}>All Courses</div>
          <div className="meta-text mt-8">{deliverables.length} deliverables</div>
        </div>
        {courses.map(course => {
          const count = deliverables.filter(d => d.course_id === course.id && d.status !== 'submitted').length;
          return (
            <div 
              key={course.id} 
              className="card" 
              style={{ cursor: 'pointer', border: selectedCourseId === course.id ? '1px solid var(--accent-academics)' : '1px solid var(--border)' }}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <div className="body-text" style={{ fontWeight: 'bold' }}>{course.name}</div>
              <div className="meta-text mt-8">
                {count > 0 ? <span className="badge badge-academics">{count} pending</span> : <span>All caught up</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Type</th>
              <th>Due Date</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliverables.length === 0 && (
              <tr><td colSpan="6" className="text-center meta-text" style={{ padding: '24px' }}>No deliverables found.</td></tr>
            )}
            {filteredDeliverables.map(deliv => (
              <tr key={deliv.id}>
                <td style={{ fontWeight: 500 }}>{deliv.title}</td>
                <td>{courses.find(c => c.id === deliv.course_id)?.code || 'Unknown'}</td>
                <td><span className="badge badge-neutral">{deliv.type.replace('_', ' ')}</span></td>
                <td>{deliv.due_date ? format(new Date(deliv.due_date), 'MMM do, yyyy') : '-'}</td>
                <td>{deliv.weight ? `${deliv.weight}%` : '-'}</td>
                <td>
                  <span 
                    className="badge badge-academics" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => cycleDeliverableStatus(deliv.id)}
                  >
                    {deliv.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
