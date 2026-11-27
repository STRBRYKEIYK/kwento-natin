import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

const LetterApp = lazy(() => import('./letter/App.jsx'));
const LibraryPage = lazy(() => import('./pages/LibraryPage.jsx'));
const PetsaPage = lazy(() => import('./pages/PetsaPage.jsx'));
const OrasPage = lazy(() => import('./pages/OrasPage.jsx'));
const StarsPage = lazy(() => import('./pages/StarsPage.jsx'));
const RegaloGardenPage = lazy(() => import('./pages/RegaloGardenPage.jsx'));
const RegaloMomentsPage = lazy(() => import('./pages/RegaloMomentsPage.jsx'));
const RegaloChicaaaPage = lazy(() => import('./pages/RegaloChicaaaPage.jsx'));
const OneElevenPage = lazy(() => import('./pages/OneElevenPage.jsx'));
const ThreeThirtyThreePage = lazy(() => import('./pages/ThreeThirtyThreePage.jsx'));
const MatamisPage = lazy(() => import('./pages/MatamisPage.jsx'));
const HilingPage = lazy(() => import('./pages/HilingPage.jsx'));
const YakapPage = lazy(() => import('./pages/YakapPage.jsx'));
const HaponPage = lazy(() => import('./pages/HaponPage.jsx'));
const TabiPage = lazy(() => import('./pages/TabiPage.jsx'));
const PangakoPage = lazy(() => import('./pages/PangakoPage.jsx'));
const LegoHousePage = lazy(() => import('./pages/LegoHousePage.jsx'));
const LegoHouseModel = lazy(() => import('./pages/LegoHouseModel.jsx'));
const BiyahePage = lazy(() => import('./pages/BiyahePage.jsx'));
const BiyaheMotorcycle = lazy(() => import('./pages/BiyaheMotorcycle.jsx'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/menu/petsa" element={<PetsaPage />} />
          <Route path="/oras" element={<OrasPage />} />
          <Route path="/1212-stars" element={<StarsPage />} />
          <Route path="/regalo/garden" element={<RegaloGardenPage />} />
          <Route path="/regalo/moments" element={<RegaloMomentsPage />} />
          <Route path="/regalo/chicaaa" element={<RegaloChicaaaPage />} />
          <Route path="/one-minute-eleven-memories" element={<OneElevenPage />} />
          <Route path="/aircon" element={<ThreeThirtyThreePage />} />
          <Route path="/matamis" element={<MatamisPage />} />
          <Route path="/hiling" element={<HilingPage />} />
          <Route path="/yakap" element={<YakapPage />} />
          <Route path="/hapon" element={<HaponPage />} />
          <Route path="/tabi" element={<TabiPage />} />
          <Route path="/pangako" element={<PangakoPage />} />
          <Route path="/lego-house" element={<LegoHousePage houseStage={<LegoHouseModel />} />} />
          <Route path="/biyahe" element={<BiyahePage motorcycleStage={({ mode, moment }) => <BiyaheMotorcycle mode={mode} moment={moment} />} />} />
          <Route path="/333" element={<Navigate to="/aircon" replace />} />
          <Route path="/third" element={
            <MotionConfig reducedMotion="user">
              <LazyMotion features={domAnimation} strict>
                <LetterApp />
              </LazyMotion>
            </MotionConfig>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
