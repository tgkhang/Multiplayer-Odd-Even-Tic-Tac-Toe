import { useEffect, useState } from "react";


const STORAGE_KEY = 'tictactoe-scores';
interface GameScore {
    wins: number,
    losses: number,
    draws: number,
    currentStreak: number
}

const initialScore: GameScore = {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0
};

export function useGameScore() {
    const [score, setScore] = useState<GameScore>(() => {
        // Load from localStorage on initial render
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load scores from localStorage:', error);
        }
        return initialScore;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
        } catch (error) {
            console.error('Failed to save scores to localStorage:', error);
        }
    }, [score])


    const addWin = () => {
        setScore((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            currentStreak: prev.currentStreak + 1,
        }));
    }

    const addLoss = () => {
        setScore((prev) => ({
            ...prev,
            wins: prev.wins - 1,
            currentStreak: 0
        }))
    }
    const addDraw = () => {
        setScore((prev) => ({
            ...prev,
            draws: prev.draws + 1,
        }));
    };

    const resetScore = () => {
        setScore(initialScore);
    };

    return {
        score,
        addWin,
        addLoss,
        addDraw,
        resetScore,
    };
}