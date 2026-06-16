import { useAuth } from '../../context/AuthContext';
import { useMeridian } from '../../context/MeridianContext';

export const SettingsView = () => {
  const { user } = useAuth();
  const { courses, deliverables, pipelineItems, contentPieces, chatMessages } = useMeridian();

  const handleExport = () => {
    const data = { courses, deliverables, pipelineItems, contentPieces, chatMessages };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meridian-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <div className="meta-text mt-8">Manage your account and preferences</div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 className="section-label">Account</h2>
        <div className="body-text">Signed in as <strong>{user?.email}</strong></div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 className="section-label">Data Management</h2>
        <div className="body-text">Export all your data as a JSON file.</div>
        <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleExport}>Export Data</button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderColor: '#EF4444' }}>
        <h2 className="section-label" style={{ color: '#EF4444' }}>Danger Zone</h2>
        <div className="body-text">Deleting data is permanent and cannot be undone. You can delete your account from the Supabase dashboard.</div>
      </div>
    </div>
  );
};
