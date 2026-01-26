import { useState, useEffect, useRef, useMemo } from 'react';
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

function Game({ gameSettings, players, onRoundEnd, onGameEnd, onLeaveRoom }) {
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
  const [playerScores, setPlayerScores] = useState({}); // Track scores per player
  const [flashColor, setFlashColor] = useState(null);
  const [buttonOrder, setButtonOrder] = useState([...COLORS]); // Track button order
  const wordRef = useRef(null);
  const instructionRef = useRef(null);
  const flashRef = useRef(null);
  const buttonShuffleIntervalRef = useRef(null);

  const speed = gameSettings?.speed || 5;
  const totalRounds = gameSettings?.rounds || 3;
  const baseTime = 5000;
  const minTime = 1000;
  // Round timer: total time allowed for the round (gets shorter each round)
  const baseRoundTime = 20000; // 20 seconds base
  const roundTimeMultiplier = Math.max(0.7, 1.2 - ((currentRound - 1) * 0.1)); // Each round has less time
  const totalRoundTime = baseRoundTime * roundTimeMultiplier;
  
  // Determine if we should shuffle buttons (after round 1)
  const shouldShuffleButtons = currentRound > 1;
  // Shuffle interval increases with round number (higher round = slower shuffling)
  const shuffleInterval = useMemo(() => 2000 + (currentRound * 500), [currentRound]); // Round 2: 3s, Round 3: 3.5s, Round 4: 4s, etc.
  
  // Progressive speed: start much slower, get faster as more words are answered
  // Also gets faster each round (round 1 is slower, round 2 is faster, etc.)
  const roundSpeedMultiplier = Math.max(0.6, 1.2 - ((currentRound - 1) * 0.15)); // Each round is faster
  const wordSpeedMultiplier = Math.max(0.3, 1.5 - (wordsAnswered * 0.04)); // Within round, gets faster
  const speedMultiplier = roundSpeedMultiplier * wordSpeedMultiplier;
  const timePerWord = Math.max(minTime, baseTime * speedMultiplier);

  useEffect(() => {
    // Auto-start game when component mounts (after countdown)
    if (!isGameActive && !showRoundEnd && currentRound <= totalRounds) {
      startGame();
    }
  }, []);

  useEffect(() => {
    if (isGameActive && !showRoundEnd && currentRound <= totalRounds && currentWord === '') {
      startNewWord();
    }
  }, [isGameActive, showRoundEnd]);

  // Round timer countdown
  useEffect(() => {
    if (isGameActive && roundTimeLeft !== null && roundTimeLeft > 0) {
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
  }, [isGameActive, roundTimeLeft]);

  // Button shuffling after round 1
  useEffect(() => {
    // Clear any existing interval first
    if (buttonShuffleIntervalRef.current) {
      clearInterval(buttonShuffleIntervalRef.current);
      buttonShuffleIntervalRef.current = null;
    }

    if (isGameActive && shouldShuffleButtons && roundTimeLeft !== null && roundTimeLeft > 0) {
      // Rotate buttons (shift positions) at intervals that increase with round number
      buttonShuffleIntervalRef.current = setInterval(() => {
        setButtonOrder(prev => {
          // Rotate: move first to last (left to right becomes middle, right, left)
          const rotated = [...prev];
          const first = rotated.shift();
          rotated.push(first);
          return rotated;
        });
      }, shuffleInterval);
    } else if (!shouldShuffleButtons) {
      // Reset to original order when not shuffling
      setButtonOrder([...COLORS]);
    }

    return () => {
      if (buttonShuffleIntervalRef.current) {
        clearInterval(buttonShuffleIntervalRef.current);
        buttonShuffleIntervalRef.current = null;
      }
    };
  }, [isGameActive, shouldShuffleButtons, roundTimeLeft, shuffleInterval]);

  useEffect(() => {
    if (showRoundEnd && currentRound >= totalRounds) {
      // All rounds complete
      onGameEnd(playerScores);
    }
  }, [showRoundEnd, currentRound, totalRounds]);

  // Word timer countdown
  useEffect(() => {
    if (isGameActive && !showRoundEnd && timeLeft !== null && timeLeft > 0 && roundTimeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            // Word time is up
            handleTimeUp();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(timer);
    } else if (isGameActive && timeLeft === 0 && roundTimeLeft > 0) {
      // Time's up, move to next word
      handleTimeUp();
    }
  }, [isGameActive, timeLeft, showRoundEnd, roundTimeLeft]);

  const startNewWord = () => {
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

    // Animate word appearance
    if (wordRef.current) {
      gsap.fromTo(
        wordRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  };

  const showFlash = (color) => {
    setFlashColor(color);
    if (flashRef.current) {
      gsap.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.6, duration: 0.2, yoyo: true, repeat: 1 }
      );
      setTimeout(() => setFlashColor(null), 400);
    }
  };

  const handleTimeUp = () => {
    // Time's up - counts as wrong answer (no score increase, flash red)
    showFlash('red');
    
    // Move to next word after flash (score stays the same - wrong answer)
    setTimeout(() => {
      if (roundTimeLeft > 0) {
        setWordsAnswered(prev => prev + 1);
        startNewWord();
      }
    }, 400);
  };

  const endRound = () => {
    setIsGameActive(false);
    setShowRoundEnd(true);
    // Add current round score to total score
    const newTotalScore = totalScore + score;
    setTotalScore(newTotalScore);
    
    // Update player scores (for multiplayer, this would sync with other players)
    // For now, just track the current player's score
    setPlayerScores(prev => {
      const updated = { ...prev };
      if (players && players.length > 0) {
        players.forEach(player => {
          if (!updated[player.id]) {
            updated[player.id] = { nickname: player.nickname, nicknameColour: player.nicknameColour, totalScore: 0 };
          }
          // For now, only update current player's score
          // In multiplayer, this would be synced via Firebase
          if (player.nickname === 'You' || true) {
            updated[player.id].totalScore = newTotalScore;
          }
        });
      } else {
        updated['current'] = { nickname: 'You', nicknameColour: '#ef4444', totalScore: newTotalScore };
      }
      return updated;
    });
  };

  const handleColorClick = (clickedColor) => {
    if (!isGameActive || timeLeft === null || showRoundEnd || roundTimeLeft <= 0) return;

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
    } else {
      showFlash('red');
    }

    setWordsAnswered(prev => prev + 1);
    
    // Move to next word if round time still available
    if (roundTimeLeft > 0) {
      startNewWord();
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setShowRoundEnd(false);
    setScore(0);
    setWordsAnswered(0);
    setCurrentWord('');
    setCurrentColor('');
    setTimeLeft(null);
    setRoundTimeLeft(totalRoundTime); // Start round timer
    setButtonOrder([...COLORS]); // Reset button order
  };

  const startNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setScore(0); // Reset round score, but keep totalScore
      setWordsAnswered(0);
      setCurrentWord('');
      setCurrentColor('');
      setTimeLeft(null);
      setRoundTimeLeft(totalRoundTime); // Start fresh round timer
      setButtonOrder([...COLORS]); // Reset button order
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
                    const playerScoreData = playerScores[player.id] || { totalScore: 0 };
                    return (
                      <div key={player.id} className="leaderboard-item">
                        <span 
                          className="leaderboard-nickname"
                          style={{ color: player.nicknameColour || '#ef4444' }}
                        >
                          {player.nickname}
                        </span>
                        <span className="leaderboard-score">
                          {playerScoreData.totalScore || 0}
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
                className="next-round-btn"
                onClick={startNextRound}
              >
                Start Round {currentRound + 1}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="play-again-btn"
                  onClick={() => {
                    // Reset game and start from round 1
                    setCurrentRound(1);
                    setTotalScore(0);
                    setScore(0);
                    setWordsAnswered(0);
                    setButtonOrder([...COLORS]);
                    setIsGameActive(true);
                    setShowRoundEnd(false);
                    setRoundTimeLeft(totalRoundTime);
                  }}
                >
                  Play Again
                </Button>
                <Button
                  variant="secondary"
                  className="leave-room-btn"
                  onClick={onLeaveRoom}
                >
                  Leave Room
                </Button>
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
            <div 
              ref={instructionRef}
              className="instruction"
            >
              Click the {currentInstruction}!
            </div>
            <div 
              ref={wordRef}
              className="color-word"
              style={{ color: COLOR_VALUES[currentColor] }}
            >
              {currentWord}
            </div>
            <div className="color-buttons">
              {buttonOrder.map((color) => (
                <button
                  key={color}
                  className="color-button"
                  onClick={() => handleColorClick(color)}
                  style={{ 
                    backgroundColor: COLOR_VALUES[color],
                    borderColor: COLOR_VALUES[color]
                  }}
                >
                  {color}
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
