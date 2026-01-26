import { useState, useEffect, useRef } from 'react';
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

function Game({ gameSettings, players, onRoundEnd, onGameEnd }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wordsAnswered, setWordsAnswered] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('WORD');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showRoundEnd, setShowRoundEnd] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [flashColor, setFlashColor] = useState(null);
  const wordRef = useRef(null);
  const instructionRef = useRef(null);
  const flashRef = useRef(null);

  const speed = gameSettings?.speed || 5;
  const totalRounds = gameSettings?.rounds || 3;
  const baseTime = 5000; // Increased from 3000
  const minTime = 1000;
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

  useEffect(() => {
    if (showRoundEnd && currentRound >= totalRounds) {
      // All rounds complete
      onGameEnd(roundScores);
    }
  }, [showRoundEnd, currentRound, totalRounds]);

  useEffect(() => {
    if (isGameActive && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (isGameActive && timeLeft === 0) {
      // Time's up, move to next word
      handleTimeUp();
    }
  }, [isGameActive, timeLeft]);

  const startNewWord = () => {
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
        { opacity: 0.3, duration: 0.2, yoyo: true, repeat: 1 }
      );
      setTimeout(() => setFlashColor(null), 400);
    }
  };

  const handleTimeUp = () => {
    // Time's up - flash red
    showFlash('red');
    
    // Move to next word after flash
    setTimeout(() => {
      setWordsAnswered(prev => prev + 1);
      // After 10 words, end the round
      if (wordsAnswered >= 9) {
        endRound();
      } else {
        startNewWord();
      }
    }, 400);
  };

  const endRound = () => {
    setIsGameActive(false);
    setShowRoundEnd(true);
    // Save score for this round
    setRoundScores(prev => ({
      ...prev,
      [`round${currentRound}`]: score
    }));
  };

  const handleColorClick = (clickedColor) => {
    if (!isGameActive || timeLeft === null || showRoundEnd) return;

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
    
    // After 10 words, end the round
    if (wordsAnswered >= 9) {
      endRound();
    } else {
      // Move to next word
      startNewWord();
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setShowRoundEnd(false);
    setScore(0);
    setWordsAnswered(0);
  };

  const startNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setScore(0);
      setWordsAnswered(0);
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
          <div className="score-info">Score: {score}</div>
        </div>
        {timeLeft !== null && isGameActive && !showRoundEnd && (
          <div className="timer-bar">
            <div 
              className="timer-fill" 
              style={{ width: `${(timeLeft / timePerWord) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="game-content">
        {showRoundEnd ? (
          <div className="round-end">
            <h2 className="round-end-title">Round {currentRound} Complete!</h2>
            <div className="leaderboard">
              <h3 className="leaderboard-title">Scores</h3>
              <div className="leaderboard-list">
                {players && players.length > 0 ? (
                  players.map((player) => (
                    <div key={player.id} className="leaderboard-item">
                      <span 
                        className="leaderboard-nickname"
                        style={{ color: player.nicknameColour || '#ef4444' }}
                      >
                        {player.nickname}
                      </span>
                      <span className="leaderboard-score">
                        {roundScores[`round${currentRound}`] || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="leaderboard-item">
                    <span className="leaderboard-nickname">You</span>
                    <span className="leaderboard-score">{score}</span>
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
              <Button
                variant="primary"
                className="next-round-btn"
                onClick={() => onGameEnd(roundScores)}
              >
                View Final Results
              </Button>
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
              {COLORS.map((color) => (
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
