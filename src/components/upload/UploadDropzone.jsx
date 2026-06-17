import { useState, useRef } from 'react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

export const UploadDropzone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);
  const fileInputRef = useRef(null);
  const { uploadDocument } = useDocumentUpload();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newStatuses = fileArray.map(f => ({ filename: f.name, status: 'uploading' }));
    setUploadStatus(prev => [...newStatuses, ...prev]);

    for (const file of fileArray) {
      const res = await uploadDocument(file);
      setUploadStatus(prev => prev.map(s => {
        if (s.filename === file.name && s.status === 'uploading') {
          return { ...s, status: res.success ? 'success' : 'error', errorMsg: res.error };
        }
        return s;
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-academics)' : 'var(--border)'}`,
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ marginBottom: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', margin: '0 auto' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3 className="body-text" style={{ fontWeight: 600 }}>Drag & Drop documents here</h3>
        <p className="meta-text mt-8">PDF, DOCX, TXT, PNG, JPG, or EML up to 10MB</p>
        <button 
          className="btn-primary mt-16" 
          style={{ pointerEvents: 'none' }}
        >
          Browse Files
        </button>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          style={{ display: 'none' }}
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.eml"
        />
      </div>

      {uploadStatus.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="section-label mb-8">Uploads</div>
          {uploadStatus.map((status, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < uploadStatus.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="body-text" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '16px' }}>{status.filename}</span>
              {status.status === 'uploading' && <span className="meta-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid var(--border)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Uploading...</span>}
              {status.status === 'success' && <span className="badge badge-content">Success</span>}
              {status.status === 'error' && <span className="badge" style={{ backgroundColor: '#EF444426', color: '#EF4444' }}>Error: {status.errorMsg}</span>}
            </div>
          ))}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
};
