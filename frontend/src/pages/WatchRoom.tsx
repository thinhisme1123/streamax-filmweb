import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import toast from 'react-hot-toast';
import { Send, Users, ArrowLeft, Copy, Check, Crown } from 'lucide-react';
import { getMovieDetail } from '../services/api';
import { AppMovieDetail, AppEpisode } from '../types/movie';
import { useAuthStore } from '../store/authStore';

// Custom Wrapper for Artplayer + HLS.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArtPlayerWrapper = ({ url, playing, onReady, onPlay, onPause, onSeek }: any) => {
  const artRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artInstance = useRef<any>(null);
  const callbacks = useRef({ onReady, onPlay, onPause, onSeek });

  useEffect(() => {
    callbacks.current = { onReady, onPlay, onPause, onSeek };
  }, [onReady, onPlay, onPause, onSeek]);

  useEffect(() => {
    if (!artRef.current || !url) return;

    const art = new Artplayer({
      container: artRef.current,
      url: url,
      autoplay: true,
      muted: true, // Autoplay policy bypass
      fullscreen: true,
      setting: true,
      playbackRate: true,
      customType: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m3u8: function playM3u8(video: any, src: string, player: any) {
          if (Hls.isSupported()) {
            if (player.hls) player.hls.destroy();
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => {});
            });
            player.hls = hls;
            player.on('destroy', () => hls.destroy());
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            player.notice.show = 'Unsupported playback format';
          }
        },
      },
    });

    artInstance.current = art;

    art.on('ready', () => {
      if (callbacks.current.onReady) {
        callbacks.current.onReady({
          getCurrentTime: () => art.currentTime,
          seekTo: (time: number) => { art.currentTime = time; },
          play: () => art.play(),
          pause: () => art.pause(),
          getPlaying: () => art.playing,
        });
      }
    });

    art.on('play', () => callbacks.current.onPlay && callbacks.current.onPlay());
    art.on('pause', () => callbacks.current.onPause && callbacks.current.onPause());
    art.on('seek', () => callbacks.current.onSeek && callbacks.current.onSeek());

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
      artInstance.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (artInstance.current) {
      if (playing) {
        artInstance.current.play().catch(() => {});
      } else {
        artInstance.current.pause();
      }
    }
  }, [playing]);

  return <div ref={artRef} className="w-full h-full" />;
};

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Dynamic URL
// Initialize outside component to avoid reconnects on every render
const socket: Socket = io(SOCKET_URL, { autoConnect: false });

interface ChatMessage {
  id: string;
  senderEmail: string;
  text: string;
  timestamp: number;
}

export const WatchRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const movieSlug = searchParams.get('movieSlug');
  const episodeSlug = searchParams.get('episodeSlug');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [movie, setMovie] = useState<AppMovieDetail | null>(null);
  const [episode, setEpisode] = useState<AppEpisode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Video State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(true); // Default to true to auto-play when loaded
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const [isHost, setIsHost] = useState(false);
  const isRemoteAction = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lastFetched = useRef<{ movieSlug: string | null; episodeSlug: string | null }>({
    movieSlug: null,
    episodeSlug: null
  });

  // 1. Fetch Movie Data
  useEffect(() => {
    if (!movieSlug) {
      setLoading(false);
      return;
    }
    // Prevent duplicate fetch in StrictMode or during frequent re-renders
    if (lastFetched.current.movieSlug === movieSlug && lastFetched.current.episodeSlug === episodeSlug) {
      return;
    }

    const fetchMovie = async () => {
      lastFetched.current = { movieSlug, episodeSlug };
      try {
        const detail = await getMovieDetail(movieSlug);
        console.log('API Response (Normalized):', detail);
        setMovie(detail);

        let foundEpisode = null;
        if (detail.episodes && detail.episodes.length > 0) {
          const allEps = detail.episodes.flatMap(s => s.episodes);
          if (episodeSlug) {
            foundEpisode = allEps.find(ep => ep.slug === episodeSlug) || allEps[0];
          } else {
            foundEpisode = allEps[0];
          }
        }
        setEpisode(foundEpisode);

        // Defensive Extraction
        if (foundEpisode && foundEpisode.linkM3u8) {
          const m3u8Link = foundEpisode.linkM3u8;
          console.log('Extracted M3U8 URL:', m3u8Link);
          setVideoUrl(m3u8Link);
        } else {
          console.error('Failed to extract linkM3u8 from episode:', foundEpisode);
        }
      } catch (err) {
        console.error('Failed to fetch movie', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieSlug, episodeSlug]);

  // 2. Socket Initialization
  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit('joinRoom', roomId);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    const onHostStatus = ({ isHost }: { isHost: boolean }) => {
      setIsHost(isHost);
      if (isHost) {
        toast.success('Bạn là chủ phòng. Bạn có quyền điều khiển video.');
      } else {
        toast.success('Bạn đã tham gia phòng với tư cách khách.');
      }
    };

    const onRequestVideoState = ({ targetGuestId }: { targetGuestId: string }) => {
      if (playerRef.current) {
        socket.emit('track-video-state', {
          roomId,
          action: playerRef.current.getPlaying() ? 'play' : 'pause',
          time: playerRef.current.getCurrentTime(),
          targetGuestId
        });
      }
    };

    const onSyncVideoState = ({ action, time }: { action: string, time: number }) => {
      if (playerRef.current) {
        if (Math.abs(playerRef.current.getCurrentTime() - time) > 0.5) {
          isRemoteAction.current = true;
          playerRef.current.seekTo(time);
        }
        
        if (action === 'play') {
          isRemoteAction.current = true;
          playerRef.current.play();
          setPlaying(true);
        } else if (action === 'pause') {
          isRemoteAction.current = true;
          playerRef.current.pause();
          setPlaying(false);
        }
      }
    };

    const onReceiveMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('host-status', onHostStatus);
    socket.on('request-video-state', onRequestVideoState);
    socket.on('sync-video-state', onSyncVideoState);
    socket.on('receiveMessage', onReceiveMessage);

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('connect', handleConnect);
      socket.off('host-status', onHostStatus);
      socket.off('request-video-state', onRequestVideoState);
      socket.off('sync-video-state', onSyncVideoState);
      socket.off('receiveMessage', onReceiveMessage);
      socket.disconnect();
    };
  }, [roomId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Video Event Handlers (Emitting to Socket)
  const handlePlay = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    if (!isHost) {
      toast.error('Chỉ chủ phòng mới có thể điều khiển video', { id: 'guest-error' });
      if (playerRef.current) {
        isRemoteAction.current = true;
        playerRef.current.pause(); // Revert to pause
        setPlaying(false);
      }
      return;
    }
    setPlaying(true);
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('track-video-state', { roomId, action: 'play', time: currentTime });
  }, [isPlayerReady, roomId, isHost]);

  const handlePause = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    if (!isHost) {
      toast.error('Chỉ chủ phòng mới có thể điều khiển video', { id: 'guest-error' });
      if (playerRef.current) {
        isRemoteAction.current = true;
        playerRef.current.play(); // Revert to play
        setPlaying(true);
      }
      return;
    }
    setPlaying(false);
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('track-video-state', { roomId, action: 'pause', time: currentTime });
  }, [isPlayerReady, roomId, isHost]);

  const handleSeek = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    if (!isHost) {
      toast.error('Chỉ chủ phòng mới có thể tua video', { id: 'guest-error' });
      return;
    }
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('track-video-state', { roomId, action: 'seek', time: currentTime });
  }, [isPlayerReady, roomId, isHost]);

  // 4. Chat Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderEmail: user?.email || 'anonymous@gmail.com',
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    // Emit with roomId as requested
    socket.emit('sendMessage', { roomId, message: msg, user: msg.senderEmail });
    setMessages(prev => [...prev, msg]); // Optimistic update
    setNewMessage('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Đang tải phòng...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-dark pt-16">
      {/* LEFT: Video Player (70%) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 relative h-full">
        <div className="p-4 bg-dark-light flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold">{movie?.title || 'Phòng Xem Chung'}</h2>
                {isHost && (
                  <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" />
                    Chủ phòng
                  </span>
                )}
              </div>
              {episode && <p className="text-sm text-gray-400">Tập: {episode.name}</p>}
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã chép link' : 'Mời bạn bè'}
          </button>
        </div>

        <div className="flex-1 bg-black relative flex items-center justify-center">
          {videoUrl ? (
            <ArtPlayerWrapper
              url={videoUrl}
              playing={playing}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onReady={(instance: any) => {
                playerRef.current = instance;
                setIsPlayerReady(true);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p>Đang tải video streaming...</p>
              <p className="text-sm mt-2 text-gray-600">Đang tìm m3u8 cho tập này</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Live Chat (30%) */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col h-[40vh] md:h-full bg-dark shrink-0">
        <div className="p-4 bg-dark-light border-b border-white/10 flex items-center gap-2 shrink-0">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-white font-bold">Live Chat</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark/50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderEmail === user?.email;
              const username = msg.senderEmail.split('@')[0];

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {!isMine && (
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                      <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold uppercase shrink-0">
                        {username.charAt(0)}
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium truncate max-w-[120px]">{username}</span>
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${isMine ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-dark-light border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-black/50 border border-white/10 text-white text-sm rounded-full px-4 py-2.5 outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4 ml-[-2px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
