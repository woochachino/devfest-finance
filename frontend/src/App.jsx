// App.jsx - Main application with routing

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import RoundIntroPage from './pages/RoundIntroPage';
import PortfolioPage from './pages/PortfolioPage';
import ResultsPage from './pages/ResultsPage';
import GameCompletePage from './pages/GameCompletePage';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/intro" element={<RoundIntroPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/complete" element={<GameCompletePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
