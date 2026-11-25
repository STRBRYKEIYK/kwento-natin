import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

const LetterApp = lazy(() => import('./letter/App.jsx'));
const LibraryPage = lazy(() => import('./pages/LibraryPage.jsx'));
const PetsaPage = lazy(() => import('./pages/PetsaPage.jsx'));
const OrasPage = lazy(() => import('./pages/OrasPage.jsx'));
const StarsPage = lazy(() => import('./pages/StarsPage.jsx'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/menu/petsa" element={<PetsaPage />} />
          <Route path="/oras" element={<OrasPage />} />
          <Route path="/1212-stars" element={<StarsPage />} />
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
