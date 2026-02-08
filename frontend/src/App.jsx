// App.jsx - Main application with routing

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import LandingPage from './pages/LandingPage';
import RoundIntroPage from './pages/RoundIntroPage';
import PortfolioPage from './pages/PortfolioPage';
import ResultsPage from './pages/ResultsPage';
import GameCompletePage from './pages/GameCompletePage';

// Multiplayer pages
import MultiplayerLobbyPage from './pages/MultiplayerLobbyPage';
import MultiplayerWaitingPage from './pages/MultiplayerWaitingPage';
import MultiplayerPlayPage from './pages/MultiplayerPlayPage';
import MultiplayerScoreboardPage from './pages/MultiplayerScoreboardPage';
import MultiplayerCompletePage from './pages/MultiplayerCompletePage';

function App() {
    return (
        <GameProvider>
            <MultiplayerProvider>
                <Router>
                    <Routes>
                        {/* Single-player routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/intro" element={<RoundIntroPage />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route path="/complete" element={<GameCompletePage />} />

                        {/* Multiplayer routes */}
                        <Route path="/multiplayer" element={<MultiplayerLobbyPage />} />
                        <Route path="/multiplayer/waiting" element={<MultiplayerWaitingPage />} />
                        <Route path="/multiplayer/play" element={<MultiplayerPlayPage />} />
                        <Route path="/multiplayer/scoreboard" element={<MultiplayerScoreboardPage />} />
                        <Route path="/multiplayer/complete" element={<MultiplayerCompletePage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </MultiplayerProvider>
        </GameProvider>
    );
}

export default App;
