import { createContext, useContext, useState, useCallback } from 'react';
import { gameData } from '../data/gameData';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    // Current round (1, 2, or 3)
    const [currentRound, setCurrentRound] = useState(1);

    // Balance starts at $10,000
    const [balance, setBalance] = useState(gameData.initialBalance);

    // Allocation percentages per stock (keyed by ticker)
    const [allocations, setAllocations] = useState({});

    // Results after calculating returns
    const [results, setResults] = useState(null);

    // K2 Think analysis data
    const [preAnalysis, setPreAnalysis] = useState(null);
    const [debrief, setDebrief] = useState(null);

    // Game state
    const [gamePhase, setGamePhase] = useState('welcome'); // welcome, portfolio, results, complete

    // History of all rounds for final summary
    const [roundHistory, setRoundHistory] = useState([]);

    // Get current round data
    const getCurrentRoundData = useCallback(() => {
        return gameData.rounds.find(r => r.id === currentRound);
    }, [currentRound]);

    // Set allocation for a specific stock
    const setStockAllocation = useCallback((ticker, percentage) => {
        setAllocations(prev => ({
            ...prev,
            [ticker]: percentage,
        }));
    }, []);

    // Reset allocations for new round
    const resetAllocations = useCallback(() => {
        setAllocations({});
    }, []);

    // Calculate total allocation percentage
    const getTotalAllocation = useCallback(() => {
        return Object.values(allocations).reduce((sum, val) => sum + val, 0);
    }, [allocations]);

    // Calculate results based on allocations and stock returns
    const calculateResults = useCallback(() => {
        const roundData = getCurrentRoundData();
        const stockResults = [];
        let totalFinalValue = 0;

        roundData.stocks.forEach(stock => {
            const allocationPercent = allocations[stock.ticker] || 0;
            const initialAmount = (allocationPercent / 100) * balance;
            const returnMultiplier = 1 + (stock.return / 100);
            const finalAmount = initialAmount * returnMultiplier;
            const gain = finalAmount - initialAmount;

            totalFinalValue += finalAmount;

            if (allocationPercent > 0) {
                stockResults.push({
                    ...stock,
                    allocationPercent,
                    initialAmount,
                    finalAmount,
                    gain,
                    returnPercent: stock.return,
                });
            }
        });

        // Sort by return (best performers first)
        stockResults.sort((a, b) => b.returnPercent - a.returnPercent);

        const overallReturn = ((totalFinalValue - balance) / balance) * 100;

        const resultsData = {
            stockResults,
            initialBalance: balance,
            finalBalance: totalFinalValue,
            overallReturn,
            bestPerformer: stockResults[0] || null,
            worstPerformer: stockResults[stockResults.length - 1] || null,
        };

        setResults(resultsData);
        return resultsData;
    }, [allocations, balance, getCurrentRoundData]);

    // Advance to next round
    const advanceToNextRound = useCallback(() => {
        // Save current round to history
        setRoundHistory(prev => [...prev, {
            round: currentRound,
            allocations: { ...allocations },
            results: { ...results },
            preAnalysis,
            debrief,
        }]);

        // Reset balance to initial balance for next round
        if (results) {
            setBalance(gameData.initialBalance);
        }

        // Move to next round or complete game
        if (currentRound < 3) {
            setCurrentRound(prev => prev + 1);
            setAllocations({});
            setResults(null);
            setPreAnalysis(null);
            setDebrief(null);
            setGamePhase('welcome');
        } else {
            setGamePhase('complete');
        }
    }, [currentRound, allocations, results, preAnalysis, debrief]);

    // Reset entire game
    const resetGame = useCallback(() => {
        setCurrentRound(1);
        setBalance(gameData.initialBalance);
        setAllocations({});
        setResults(null);
        setPreAnalysis(null);
        setDebrief(null);
        setGamePhase('welcome');
        setRoundHistory([]);
    }, []);

    // Start round (go to portfolio builder)
    const startRound = useCallback(() => {
        setGamePhase('portfolio');
    }, []);

    // Lock in portfolio and go to results
    const lockInPortfolio = useCallback(() => {
        calculateResults();
        setGamePhase('results');
    }, [calculateResults]);

    const value = {
        // State
        currentRound,
        balance,
        allocations,
        results,
        preAnalysis,
        debrief,
        gamePhase,
        roundHistory,

        // Computed
        getCurrentRoundData,
        getTotalAllocation,

        // Actions
        setStockAllocation,
        resetAllocations,
        calculateResults,
        advanceToNextRound,
        resetGame,
        startRound,
        lockInPortfolio,
        setPreAnalysis,
        setDebrief,
        setGamePhase,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

export default GameContext;
