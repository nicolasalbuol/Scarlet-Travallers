import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from '@/pages/Login';
import NewPassword from '@/components/NewPassword';
import { useLocation } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Book from '@/pages/Book';
import Characters from '@/pages/Characters';
import CharacterSheet from '@/pages/CharacterSheet';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import SharedCharacter from '@/pages/SharedCharacter';
import CharacterBuilder from '@/pages/CharacterBuilder';
import Campaigns from '@/pages/Campaigns';
import CampaignDetail from '@/pages/CampaignDetail';
import MasterArea from '@/pages/MasterArea';
import Sigil from '@/components/fx/Sigil';
import { useTheme } from '@/lib/theme';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, recovering } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-6">
        <Sigil size={200} />
        <div className="font-cinzel text-xs tracking-[0.5em] text-muted-foreground animate-pulse">CARREGANDO</div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Link público de ficha funciona sem login; o resto pede conta.
  const isPublic = location.pathname.startsWith('/shared/');
  if (recovering) return <NewPassword />;
  if (!user && !isPublic) return <Login />;
  if (user && location.pathname === '/login') { window.location.replace('/'); return null; }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/character/:id" element={<CharacterSheet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mestre" element={<MasterArea />} />
      </Route>
      <Route path="/character/new" element={<CharacterBuilder />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/shared/:token" element={<SharedCharacter />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const theme = useTheme();
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster theme={theme} position="top-center" richColors closeButton />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App