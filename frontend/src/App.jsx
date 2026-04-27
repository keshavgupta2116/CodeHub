import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Landing from './pages/Landing';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Projects from './pages/Projects';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import './index.css';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#e6edf3', border: '1px solid #30363d' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="editor"    element={<Editor />} />
            <Route path="editor/:projectId" element={<Editor />} />
            <Route path="projects"  element={<Projects />} />
            <Route path="community" element={<Community />} />
            <Route path="community/:id" element={<PostDetail />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile"   element={<Profile />} />
            <Route path="profile/:username" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
