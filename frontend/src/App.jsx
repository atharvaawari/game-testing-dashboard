import React from 'react';
import GameReleases from './GameReleases';
import { GameContextProvider } from './Context/gameContext';

function App() {
  return (
    <div className="App">
      <GameContextProvider>
      <GameReleases />
      </GameContextProvider>
    </div>
  );
}

export default App;
