import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  linkEmbed: string;
  linkM3u8: string;
  title: string;
  onClose: () => void;
}

export const VideoPlayer = ({ linkEmbed, title, onClose }: VideoPlayerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5"
    >
      {/* Top gradient bar with title and close */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-white/80 truncate max-w-[300px]">{title}</span>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Iframe Player */}
      <iframe
        src={linkEmbed}
        title={title}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Bottom decorative glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </motion.div>
  );
};
