import React from 'react';

interface AudioButtonProps {
  filename: string;
}

const AudioButton: React.FC<AudioButtonProps> = ({ filename }) => {
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = new Audio(`/audio/${filename}`);
    audio.play().catch(err => console.error("Audio playback failed", err));
  };

  return (
    <button
      onClick={playAudio}
      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors flex items-center justify-center"
      title="Play Audio"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    </button>
  );
};

export default AudioButton;
