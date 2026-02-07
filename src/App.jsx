// App.jsx - Main application with routing

import { GameProvider, useGame } from './context/GameContext';
import WelcomePage from './pages/WelcomePage';
import PortfolioPage from './pages/PortfolioPage';
import ResultsPage from './pages/ResultsPage';
import GameCompletePage from './pages/GameCompletePage';

function GameRouter() {
    const { gamePhase } = useGame();

    switch (gamePhase) {
        case 'welcome':
            return <WelcomePage />;
        case 'portfolio':
            return <PortfolioPage />;
        case 'results':
            return <ResultsPage />;
        case 'complete':
            return <GameCompletePage />;
        default:
            return <WelcomePage />;
    }
}

function App() {
    return (
        <GameProvider>
            <GameRouter />
        </GameProvider>
    );
}

export default App;
