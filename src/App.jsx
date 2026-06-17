import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MeridianProvider } from './context/MeridianContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MainContent } from './components/layout/MainContent';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';

import { Dashboard } from './components/dashboard/Dashboard';
import { AcademicsView } from './components/academics/AcademicsView';
import { PipelineView } from './components/pipeline/PipelineView';
import { ContentView } from './components/content/ContentView';
import { InboxView } from './components/inbox/InboxView';
import { SettingsView } from './components/settings/SettingsView';

import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/" element={<ProtectedRoute><MeridianProvider><MainContent /></MeridianProvider></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="academics" element={<AcademicsView />} />
            <Route path="pipeline" element={<PipelineView />} />
            <Route path="content" element={<ContentView />} />
            <Route path="inbox" element={<InboxView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
