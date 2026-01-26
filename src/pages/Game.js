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

function Game({ gameSettings, onGameEnd }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('WORD');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const wordRef = useRef(null);
  const instructionRef = useRef(null);

  const speed = gameSettings?.speed || 5;
  const totalRounds = gameSettings?.rounds || 3;
  const timePerWord = Math.max(1000, 3000 - (speed * 200)); // Faster speed = less time

  useEffect(() => {
    if (isGameActive && currentRound <= totalRounds) {
      startNewWord();
    } else if (currentRound > totalRounds) {
      // Game over
      onGameEnd(score);
    }
  }, [isGameActive, currentRound]);

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

  const handleTimeUp = () => {
    // Move to next word or round
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    } else {
      setIsGameActive(false);
    }
  };

  const handleColorClick = (clickedColor) => {
    if (!isGameActive || timeLeft === null) return;

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
      // Move to next word
      startNewWord();
    } else {
      // Wrong answer, move to next word anyway
      startNewWord();
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setCurrentRound(1);
    setScore(0);
  };

  return (
    <div className="game">
      <div className="game-header">
        <div className="game-info">
          <div className="round-info">Round {currentRound} / {totalRounds}</div>
          <div className="score-info">Score: {score}</div>
        </div>
        {timeLeft !== null && isGameActive && (
          <div className="timer-bar">
            <div 
              className="timer-fill" 
              style={{ width: `${(timeLeft / timePerWord) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="game-content">
        {!isGameActive ? (
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
                <Button
                  key={color}
                  variant="primary"
                  className="color-button"
                  onClick={() => handleColorClick(color)}
                  style={{ 
                    backgroundColor: COLOR_VALUES[color],
                    borderColor: COLOR_VALUES[color]
                  }}
                >
                  {color}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Game;
