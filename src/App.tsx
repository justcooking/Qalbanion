import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TypographyProvider } from './contexts/TypographyContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CollectionsProvider } from './contexts/CollectionsContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { JournalPage } from './pages/JournalPage';
import { EntryEditorPage } from './pages/EntryEditorPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ReflectionsPage } from './pages/ReflectionsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // If user is logged in, show their personal journal home; otherwise show welcoming landing page
  if (!user) {
    return <LandingPage />;
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <TypographyProvider>
        <AuthProvider>
          <CollectionsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<RootRoute />} />
                <Route path="/welcome" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Application Workspace Routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route path="home" element={<HomePage />} />
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
          </CollectionsProvider>
        </AuthProvider>
      </TypographyProvider>
    </ThemeProvider>
  );
}
