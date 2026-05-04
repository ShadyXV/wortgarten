import React from 'react';
import { Volume2 } from 'lucide-react';

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
      className="wg-icon-btn"
      title="Play Audio"
    >
      <Volume2 className="w-4 h-4" />
    </button>
  );
};

export default AudioButton;
