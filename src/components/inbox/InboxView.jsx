import { useMeridian } from '../../context/MeridianContext';
import { UploadDropzone } from '../upload/UploadDropzone';
import { format } from 'date-fns';

export const InboxView = () => {
  const { documents } = useMeridian();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#e5e7eb', text: '#374151' };
      case 'processing': return { bg: '#e0e7ff', text: '#4f46e5' };
      case 'extracted': return { bg: '#fef3c7', text: '#d97706' };
      case 'confirmed': return { bg: '#d1fae5', text: '#059669' };
      case 'rejected':
      case 'failed': return { bg: '#fee2e2', text: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const handleRowClick = (doc) => {
    if (doc.status === 'extracted') {
      console.log('Extraction preview for document:', doc.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="page-title">Inbox</h1>
        <div className="meta-text mt-8">Upload documents to extract deliverables, applications, and ideas</div>
      </div>

      <UploadDropzone />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Filename</th>
              <th>Source</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr><td colSpan="4" className="text-center meta-text" style={{ padding: '24px' }}>No documents uploaded yet.</td></tr>
            )}
            {documents.map(doc => {
              const statusStyle = getStatusColor(doc.status);
              return (
                <tr 
                  key={doc.id} 
                  style={{ cursor: doc.status === 'extracted' ? 'pointer' : 'default' }}
                  onClick={() => handleRowClick(doc)}
                >
                  <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{doc.filename}</span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{doc.source_type}</span>
                  </td>
                  <td>{format(new Date(doc.created_at), 'MMM do, yyyy h:mm a')}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {doc.status === 'processing' && <div className="spinner" style={{ width: '8px', height: '8px', border: '2px solid transparent', borderTopColor: statusStyle.text, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
