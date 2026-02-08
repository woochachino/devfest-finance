import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { gameData } from '../data/gameData';

const GameContext = createContext(null);

const ROUNDS_PER_GAME = 3;

export function GameProvider({ children }) {
    // Current round index within this session (1, 2, or 3)
    const [currentRound, setCurrentRound] = useState(1);

    // Randomly selected round objects for this session
    const [selectedRounds, setSelectedRounds] = useState([]);

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
    const [gamePhase, setGamePhase] = useState('landing'); // landing, roundIntro, portfolio, results, complete

    // Game Mode: 'chill' or 'panic'
    const [gameMode, setGameMode] = useState(null);

    // History of all rounds for final summary
    const [roundHistory, setRoundHistory] = useState([]);

    // Highscore from localStorage
    const [highscore, setHighscore] = useState(() => {
        const saved = localStorage.getItem('marketmind_highscore');
        return saved ? parseFloat(saved) : null;
    });

    // Get current round data from the randomly selected rounds
    const getCurrentRoundData = useCallback(() => {
        return selectedRounds[currentRound - 1] || null;
    }, [currentRound, selectedRounds]);

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

    // Check if player is bankrupt (balance under $5000)
    const isBankrupt = useCallback((balanceToCheck) => {
        return balanceToCheck < 5000;
    }, []);

    // Game over state
    const [isGameOver, setIsGameOver] = useState(false);

    // Advance to next round
    const advanceToNextRound = useCallback(() => {
        // Save current round to history — use the actual round ID, not session index
        const roundData = selectedRounds[currentRound - 1];
        setRoundHistory(prev => [...prev, {
            round: roundData?.id ?? currentRound,
            allocations: { ...allocations },
            results: { ...results },
            preAnalysis,
            debrief,
        }]);

        // Carry over final balance to next round
        const newBalance = results?.finalBalance ?? balance;
        if (results) {
            setBalance(newBalance);
        }

        // Check for bankruptcy
        if (isBankrupt(newBalance)) {
            setIsGameOver(true);
            setGamePhase('complete');
            return;
        }

        // Move to next round or complete game
        const isUnlimited = gameMode === 'chill';
        const hasMoreRounds = isUnlimited || currentRound < ROUNDS_PER_GAME;

        if (hasMoreRounds) {
            const nextIdx = currentRound; // 0-indexed into selectedRounds for the NEXT round
            // If we've exhausted selectedRounds, add another random round
            if (nextIdx >= selectedRounds.length) {
                const usedIds = new Set(selectedRounds.map(r => r.id));
                const unused = gameData.rounds.filter(r => !usedIds.has(r.id));
                // If all rounds used, recycle from the full pool
                const pool = unused.length > 0 ? unused : gameData.rounds;
                const next = pool[Math.floor(Math.random() * pool.length)];
                setSelectedRounds(prev => [...prev, next]);
            }
            setCurrentRound(prev => prev + 1);
            setAllocations({});
            setResults(null);
            setPreAnalysis(null);
            setDebrief(null);
            setGamePhase('roundIntro');
        } else {
            // Game complete — save highscore
            if (!highscore || newBalance > highscore) {
                setHighscore(newBalance);
                localStorage.setItem('marketmind_highscore', String(newBalance));
            }
            setGamePhase('complete');
        }
    }, [currentRound, selectedRounds, gameMode, allocations, results, preAnalysis, debrief, balance, highscore, isBankrupt]);

    // Reset entire game
    const resetGame = useCallback(() => {
        setCurrentRound(1);
        setSelectedRounds([]);
        setBalance(gameData.initialBalance);
        setAllocations({});
        setResults(null);
        setPreAnalysis(null);
        setDebrief(null);
        setGamePhase('landing');
        setRoundHistory([]);
        setGameMode(null);
        setIsGameOver(false);
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
        selectedRounds,
        balance,
        allocations,
        results,
        preAnalysis,
        debrief,
        gamePhase,
        gameMode,
        roundHistory,
        highscore,
        isGameOver,

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
        setGameMode,

        // Navigation
        startGame: () => {
            // Randomly pick ROUNDS_PER_GAME rounds from the pool
            const shuffled = [...gameData.rounds].sort(() => Math.random() - 0.5);
            setSelectedRounds(shuffled.slice(0, ROUNDS_PER_GAME));
            setGamePhase('roundIntro');
        },
        goHome: () => {
            resetGame();
            setGamePhase('landing');
        },
        goBack: () => {
            switch (gamePhase) {
                case 'roundIntro':
                    setGamePhase('landing');
                    break;
                case 'portfolio':
                    setGamePhase('roundIntro');
                    break;
                case 'results':
                    setGamePhase('portfolio');
                    // Optional: reset results if going back? 
                    // For now, keep results so they don't lose data, but they can re-submit.
                    break;
                default:
                    break;
            }
        },
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
