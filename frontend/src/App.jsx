// App.jsx - Main application with routing

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import WelcomePage from './pages/WelcomePage';
import PortfolioPage from './pages/PortfolioPage';
import ResultsPage from './pages/ResultsPage';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/game-start" element={<WelcomePage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
