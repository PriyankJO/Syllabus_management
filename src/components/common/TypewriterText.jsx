import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 50, className, style }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span 
      className={className} 
      style={{
        ...style,
        display: 'inline-block',
        animation: 'slideInRight 0.5s ease-out forwards'
      }}
    >
      {currentText}
      <span style={{ 
        borderRight: '2px solid var(--color-primary)',
        animation: 'blink 0.75s step-end infinite',
        marginLeft: '2px'
      }}></span>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          from, to { border-color: transparent; }
          50% { border-color: var(--color-primary); }
        }
      `}</style>
    </span>
  );
};

export default TypewriterText;
