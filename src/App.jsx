import React from 'react';
import HeroSection from './components/HeroSection.jsx';
import OfficeGame from './components/games/OfficeGame.jsx';
import FlowerBouquet from './components/FlowerBouquet.jsx';

function App() {
  return (
    <main className="w-full min-h-screen bg-[var(--midnight-blue)] text-white font-sans selection:bg-[var(--rose-gold)] selection:text-white pb-20">
      <HeroSection />
      <OfficeGame />
      <FlowerBouquet />
    </main>
  );
}

export default App;
