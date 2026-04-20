import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import Button from '../components/Button';
import './Game.css';

const COLORS = ['RED', 'GREEN', 'BLUE'];
const COLOR_VALUES = {
  'RED': '#ef4444',
  'GREEN': '#10b981',
  'BLUE': '#3b82f6'
};

const INSTRUCTIONS = ['WORD', 'COLOR'];

function Game({ gameSettings, players, currentPlayerId, isHost, isPaused, onTogglePause, onGameEnd }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0); // Cumulative score across all rounds
  const [wordsAnswered, setWordsAnswered] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('WORD');
  const [timeLeft, setTimeLeft] = useState(null);
  const [roundTimeLeft, setRoundTimeLeft] = useState(null); // Total time for the round
  const [isGameActive, setIsGameActive] = useState(false);
  const [showRoundEnd, setShowRoundEnd] = useState(false);
  const [hasSubmittedFinalScore, setHasSubmittedFinalScore] = useState(false);
  const [isSubmittingFinalScore, setIsSubmittingFinalScore] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState({ type: '', text: '' });
  const [showButtonText, setShowButtonText] = useState(true); // Track whether to show words or just colored squares
  const wordRef = useRef(null);
  const instructionRef = useRef(null);
  const flashRef = useRef(null);
  const feedbackRef = useRef(null);
  const buttonShuffleIntervalRef = useRef(null);
  const handleTimeUpRef = useRef(false);
  const feedbackTimerRef = useRef(null);

  const difficulty = gameSettings?.difficulty || 'normal';
  const totalRounds = gameSettings?.rounds || 3;
  const baseTime = 5000;
  const minTime = 1000;
  // Round timer: total time allowed for the round (gets shorter each round)
  const baseRoundTime = 20000; // 20 seconds base
  const roundTimeMultiplier = Math.max(0.7, 1.2 - ((currentRound - 1) * 0.1)); // Each round has less time
  const totalRoundTime = baseRoundTime * roundTimeMultiplier;
  
  // Difficulty-based settings
  const difficultySettings = useMemo(() => {
    switch (difficulty) {
      case 'easy':
        return {
          buttonToggleInterval: null, // Always show words
          baseSpeedMultiplier: 0.8, // Slower base speed
          roundSpeedIncrease: 0.05, // Slow ramp up per round
        };
      case 'normal':
        return {
          buttonToggleInterval: 8000, // Switch every 8 seconds
          baseSpeedMultiplier: 0.6, // Faster than easy
          roundSpeedIncrease: 0.1, // Faster ramp up per round
        };
      case 'difficult':
        return {
          buttonToggleInterval: 4000, // Switch every 4 seconds
          baseSpeedMultiplier: 0.4, // Fastest
          roundSpeedIncrease: 0.15, // Fastest ramp up per round
        };
      default:
        return {
          buttonToggleInterval: 8000,
          baseSpeedMultiplier: 0.6,
          roundSpeedIncrease: 0.1,
        };
    }
  }, [difficulty]);
  
  // Determine if we should toggle button display based on difficulty
  const shouldToggleButtonDisplay = difficultySettings.buttonToggleInterval !== null;
  // Button toggle interval (adjusted for round - gets faster each round)
  const buttonToggleInterval = useMemo(() => {
    if (!shouldToggleButtonDisplay) return null;
    const baseInterval = difficultySettings.buttonToggleInterval;
    // Each round, reduce interval by 10% (make it faster)
    const roundReduction = (currentRound - 1) * 0.1;
    const calculatedInterval = Math.max(baseInterval * 0.5, baseInterval * (1 - roundReduction));
    return calculatedInterval;
  }, [shouldToggleButtonDisplay, difficultySettings.buttonToggleInterval, currentRound]);
  
  // Progressive speed: gets faster each round based on difficulty
  const roundSpeedMultiplier = useMemo(() => {
    const base = difficultySettings.baseSpeedMultiplier;
    const increase = difficultySettings.roundSpeedIncrease * (currentRound - 1);
    return Math.max(0.3, base - increase); // Lower = faster
  }, [difficultySettings, currentRound]);
  
  const wordSpeedMultiplier = Math.max(0.3, 1.5 - (wordsAnswered * 0.04)); // Within round, gets faster
  const progressiveMultiplier = roundSpeedMultiplier * wordSpeedMultiplier;
  // Apply difficulty and progressive multipliers
  const timePerWord = Math.max(minTime, baseTime * progressiveMultiplier);

  // Define functions before they're used in useEffect hooks
  const showFlash = useCallback((color) => {
    setFlashColor(color);
    if (flashRef.current) {
      gsap.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.6, duration: 0.2, yoyo: true, repeat: 1 }
      );
      setTimeout(() => setFlashColor(null), 400);
    }
  }, []);

  const showAnswerFeedback = useCallback((type, text) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    setAnswerFeedback({ type, text });

    if (feedbackRef.current) {
      gsap.fromTo(
        feedbackRef.current,
        { opacity: 0, y: 8, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }

    feedbackTimerRef.current = setTimeout(() => {
      setAnswerFeedback({ type: '', text: '' });
    }, 500);
  }, []);

  const startNewWord = useCallback(() => {
    // Don't start new word if round time is up
    if (roundTimeLeft <= 0) {
      return;
    }

    // Pick random word and color (different from word)
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let color = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (color === word) {
      color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    // Alternate instruction type
    const instruction = INSTRUCTIONS[Math.floor(Math.random() * INSTRUCTIONS.length)];

    setCurrentWord(word);
    setCurrentColor(color);
    setCurrentInstruction(instruction);
    setTimeLeft(timePerWord);
    handleTimeUpRef.current = false; // Reset time up flag when starting new word

    // Animate word appearance
    if (wordRef.current) {
      gsap.fromTo(
        wordRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [roundTimeLeft, timePerWord]);

  const handleTimeUp = useCallback(() => {
    // Prevent multiple calls using ref
    if (handleTimeUpRef.current) return;
    handleTimeUpRef.current = true;
    
    // Time's up counts as a miss.
    showFlash('red');
    showAnswerFeedback('wrong', 'Too Slow!');
    
    // Move to next word after flash (score stays the same - wrong answer)
    setTimeout(() => {
      if (roundTimeLeft > 0 && isGameActive && !showRoundEnd) {
        setWordsAnswered(prev => prev + 1);
        handleTimeUpRef.current = false; // Reset flag
        startNewWord();
      } else {
        handleTimeUpRef.current = false; // Reset flag
      }
    }, 400);
  }, [roundTimeLeft, isGameActive, showRoundEnd, startNewWord, showFlash, showAnswerFeedback]);

  const endRound = useCallback(() => {
    setIsGameActive(false);
    setShowRoundEnd(true);
    // Add current round score to total score.
    setTotalScore(prev => prev + score);
  }, [score]);

  const startGame = () => {
    setIsGameActive(true);
    setShowRoundEnd(false);
    setScore(0);
    setWordsAnswered(0);
    setCurrentWord('');
    setCurrentColor('');
    setTimeLeft(null);
    setRoundTimeLeft(totalRoundTime); // Start round timer
    setShowButtonText(true); // Start with words
  };

  useEffect(() => {
    // Auto-start game when component mounts (after countdown)
    if (!isGameActive && !showRoundEnd && currentRound <= totalRounds) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isGameActive && !showRoundEnd && currentRound <= totalRounds && currentWord === '') {
      startNewWord();
    }
  }, [isGameActive, showRoundEnd, currentRound, currentWord, totalRounds, startNewWord]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Round timer countdown
  useEffect(() => {
    if (isGameActive && !isPaused && roundTimeLeft !== null && roundTimeLeft > 0) {
      const timer = setInterval(() => {
        setRoundTimeLeft(prev => {
          if (prev <= 100) {
            // Round time is up
            endRound();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isGameActive, isPaused, roundTimeLeft, endRound]);

  // Button display toggle based on difficulty (words vs colored squares)
  useEffect(() => {
    // Clear any existing interval first
    if (buttonShuffleIntervalRef.current) {
      clearInterval(buttonShuffleIntervalRef.current);
      buttonShuffleIntervalRef.current = null;
    }

    if (isGameActive && !isPaused && shouldToggleButtonDisplay && buttonToggleInterval && roundTimeLeft !== null && roundTimeLeft > 0 && !showRoundEnd) {
      // Toggle between words and colored squares at difficulty-based intervals
      buttonShuffleIntervalRef.current = setInterval(() => {
        setShowButtonText(prev => {
          const newValue = !prev;
          console.log('Button display toggled:', newValue ? 'WORDS' : 'SQUARES');
          return newValue;
        });
      }, buttonToggleInterval);
    } else {
      // Always show words in easy mode or when game is not active
      if (!shouldToggleButtonDisplay || !isGameActive || showRoundEnd) {
        setShowButtonText(true);
      }
    }

    return () => {
      if (buttonShuffleIntervalRef.current) {
        clearInterval(buttonShuffleIntervalRef.current);
        buttonShuffleIntervalRef.current = null;
      }
    };
  }, [isGameActive, isPaused, shouldToggleButtonDisplay, buttonToggleInterval, roundTimeLeft, showRoundEnd]);

  // Word timer countdown
  useEffect(() => {
    if (isGameActive && !isPaused && !showRoundEnd && timeLeft !== null && timeLeft > 0 && roundTimeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            // Word time is up - set to 0 and trigger handleTimeUp only once
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isGameActive, isPaused, timeLeft, showRoundEnd, roundTimeLeft]);

  // Handle time up separately to prevent multiple triggers
  useEffect(() => {
    if (isGameActive && !isPaused && timeLeft === 0 && !showRoundEnd && roundTimeLeft > 0) {
      handleTimeUp();
    }
  }, [timeLeft, isGameActive, isPaused, showRoundEnd, roundTimeLeft, handleTimeUp]);

  const handleColorClick = (clickedColor) => {
    if (!isGameActive || isPaused || timeLeft === null || showRoundEnd || roundTimeLeft <= 0) return;

    let isCorrect = false;
    if (currentInstruction === 'WORD') {
      // Click what the text says
      isCorrect = clickedColor === currentWord;
    } else {
      // Click what color the text is
      isCorrect = clickedColor === currentColor;
    }

    if (isCorrect) {
      setScore(score + 1);
      showFlash('green');
      showAnswerFeedback('correct', 'Correct!');
    } else {
      showFlash('red');
      showAnswerFeedback('wrong', 'Wrong!');
    }

    setWordsAnswered(prev => prev + 1);
    
    // Move to next word if round time still available
    if (roundTimeLeft > 0) {
      startNewWord();
    }
  };

  const instructionText = currentInstruction === 'WORD'
    ? 'Match THE WORD'
    : 'Match THE COLOUR';

  const startNextRound = () => {
    if (currentRound < totalRounds) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setScore(0); // Reset round score, but keep totalScore
      setWordsAnswered(0);
      setCurrentWord('');
      setCurrentColor('');
      setTimeLeft(null);
      // Calculate round time for the NEXT round
      const nextRoundTimeMultiplier = Math.max(0.7, 1.2 - ((nextRound - 1) * 0.1));
      const nextRoundTime = baseRoundTime * nextRoundTimeMultiplier;
      setRoundTimeLeft(nextRoundTime); // Start fresh round timer for next round
      setShowButtonText(true); // Start with words
      setIsGameActive(true);
      setShowRoundEnd(false);
    }
  };

  return (
    <div className="game">
      <div 
        ref={flashRef}
        className={`flash-overlay ${flashColor || ''}`}
      />
      
      <div className="game-header">
        <div className="game-info">
          <div className="round-info">Round {currentRound} / {totalRounds}</div>
          <div className="score-info">
            Total: {totalScore} | Round: {score}
            {roundTimeLeft !== null && isGameActive && !showRoundEnd && (
              <span className="round-timer"> {Math.ceil(roundTimeLeft / 1000)}s</span>
            )}
          </div>
          {isGameActive && !showRoundEnd && (
            <div className="pause-controls">
              {isHost ? (
                <Button
                  variant="secondary"
                  className="pause-game-btn"
                  onClick={() => onTogglePause(!isPaused)}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              ) : isPaused ? (
                <span className="paused-badge">Paused by Host</span>
              ) : null}
            </div>
          )}
        </div>
        {timeLeft !== null && isGameActive && !showRoundEnd && roundTimeLeft > 0 && (
          <div className="timer-bar">
            <div 
              className="timer-fill" 
              style={{ width: `${Math.max(0, (timeLeft / timePerWord) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="game-content">
        {showRoundEnd ? (
          <div className="round-end">
            <h2 className="round-end-title">Round {currentRound} Complete!</h2>
            <div className="leaderboard">
              <h3 className="leaderboard-title">Total Scores</h3>
              <div className="leaderboard-list">
                {players && players.length > 0 ? (
                  players.map((player) => {
                    const isCurrentPlayer = player.id === currentPlayerId;
                    return (
                      <div key={player.id} className="leaderboard-item">
                        <span 
                          className="leaderboard-nickname"
                          style={{ color: player.nicknameColour || '#ef4444' }}
                        >
                          {player.nickname}
                        </span>
                        <span className="leaderboard-score">
                          {isCurrentPlayer ? totalScore : 0}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="leaderboard-item">
                    <span className="leaderboard-nickname">You</span>
                    <span className="leaderboard-score">{totalScore}</span>
                  </div>
                )}
              </div>
            </div>
            {currentRound < totalRounds ? (
              <Button
                variant="primary"
                className="round-action-btn round-action-btn--next"
                onClick={startNextRound}
              >
                Start Round {currentRound + 1}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="round-action-btn round-action-btn--results"
                  disabled={hasSubmittedFinalScore || isSubmittingFinalScore}
                  onClick={async () => {
                    if (hasSubmittedFinalScore || isSubmittingFinalScore) return;

                    setIsSubmittingFinalScore(true);
                    try {
                      await onGameEnd({ totalScore });
                      setHasSubmittedFinalScore(true);
                    } finally {
                      setIsSubmittingFinalScore(false);
                    }
                  }}
                >
                  {isSubmittingFinalScore
                    ? 'Submitting Score...'
                    : hasSubmittedFinalScore
                      ? 'Score Submitted'
                      : 'View Final Results'}
                </Button>
                {hasSubmittedFinalScore && (
                  <p className="waiting-for-scores-text">Waiting for other players to submit...</p>
                )}
              </>
            )}
          </div>
        ) : !isGameActive ? (
          <div className="game-start">
            <h2 className="game-title">Ready to Play?</h2>
            <Button
              variant="primary"
              className="start-game-btn"
              onClick={startGame}
            >
              Start Round {currentRound}
            </Button>
          </div>
        ) : (
          <>
            {isPaused && (
              <div className="pause-overlay">
                <h3 className="pause-overlay__title">Game Paused</h3>
                <p className="pause-overlay__message">
                  {isHost ? 'Press Resume when everyone is ready.' : 'Waiting for host to resume.'}
                </p>
              </div>
            )}
            <div 
              ref={instructionRef}
              className="instruction"
            >
              {instructionText}
            </div>
            <div
              ref={feedbackRef}
              className={`answer-feedback ${answerFeedback.type ? `show ${answerFeedback.type}` : ''}`}
              aria-live="polite"
            >
              {answerFeedback.text}
            </div>
            <div 
              ref={wordRef}
              className="color-word"
              style={{ color: COLOR_VALUES[currentColor] }}
            >
              {currentWord}
            </div>
            <div className="color-buttons">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="color-button"
                  disabled={isPaused}
                  onClick={() => handleColorClick(color)}
                  style={{ 
                    backgroundColor: COLOR_VALUES[color],
                    borderColor: COLOR_VALUES[color]
                  }}
                >
                  {showButtonText ? color : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Game;
