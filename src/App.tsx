import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { EntryEditorPage } from './pages/EntryEditorPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ReflectionsPage } from './pages/ReflectionsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="journal/new" element={<EntryEditorPage />} />
              <Route path="journal/:id" element={<EntryEditorPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="reflections" element={<ReflectionsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
