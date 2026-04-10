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
      className="p-2 rounded-full border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 active:scale-95 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.05)]"
      title="Play Audio"
    >
      <Volume2 className="w-4 h-4" />
    </button>
  );
};

export default AudioButton;
