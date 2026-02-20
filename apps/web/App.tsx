
import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ActivityFeed } from './components/ActivityFeed';
import { UserProfile } from './components/UserProfile';
import { MapFinder } from './components/MapFinder';
import { Onboarding } from './components/Onboarding';
import { Bookings } from './components/Bookings';
import { Community } from './components/Community';
import { AdminDashboard } from './components/AdminDashboard';
import { Preloader } from './components/Preloader';
import { NotFound } from './components/NotFound';
import { Language } from './types';
import { AuthProvider } from './src/context/AuthContext';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  return (
    <AuthProvider>
      {!isAppReady && <Preloader minDisplayTime={2000} onComplete={() => setIsAppReady(true)} />}

      <div className={`transition-opacity duration-700 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <HashRouter>
          {showOnboarding && <Onboarding lang={lang} onClose={() => setShowOnboarding(false)} />}
          <Layout lang={lang} setLang={setLang}>
            <Routes>
              <Route path="/" element={<ActivityFeed lang={lang} />} />
              <Route path="/dashboard" element={<Dashboard lang={lang} />} />
              <Route path="/bookings" element={<Bookings lang={lang} />} />
              <Route path="/community" element={<Community lang={lang} />} />
              <Route path="/admin" element={<AdminDashboard lang={lang} />} />
              <Route path="/profile" element={<UserProfile lang={lang} />} />
              <Route path="/map" element={<MapFinder lang={lang} />} />
              {/* Fallback route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </div>
    </AuthProvider>
  );
};

export default App;
