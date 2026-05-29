<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, MonitorPlay } from 'lucide-react';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { VideoPlayer } from '../components/VideoPlayer';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export const WatchMovie = () => {
  const { movieSlug, episodeSlug } = useParams<{ movieSlug: string; episodeSlug: string }>();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetail(movieSlug);

  const [activeServer, setActiveServer] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieSlug, episodeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen flex items-center justify-center bg-dark">
        <div className="bg-red-900/30 border border-red-500/30 backdrop-blur-sm p-8 rounded-2xl text-white max-w-md">
          <h2 className="text-2xl font-bold mb-3">Không tìm thấy phim</h2>
          <p className="text-gray-300 mb-6">{error || 'Phim không tồn tại hoặc đã bị xoá.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const currentServer = movie.episodes[activeServer];
  const selectedEpisode = currentServer?.episodes.find((ep) => ep.slug === episodeSlug) || currentServer?.episodes[0];

  const handlePlayEpisode = (epSlug: string) => {
    navigate(`/xem-phim/${movieSlug}/${epSlug}`);
  };

  return (
    <div className="min-h-screen bg-dark pb-20 pt-20">
      {/* Top Bar with Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mb-6">
        <button
          onClick={() => navigate(`/phim/${movieSlug}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại thông tin phim</span>
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full bg-black">
        <div className="max-w-7xl mx-auto">
          {selectedEpisode ? (
            <VideoPlayer
              linkEmbed={selectedEpisode.linkEmbed}
              linkM3u8={selectedEpisode.linkM3u8}
              title={`${movie.title} - ${selectedEpisode.name}`}
              movie={movie}
              episodeName={selectedEpisode.name}
              onClose={() => navigate(`/phim/${movieSlug}`)}
            />
          ) : (
             <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
                Tập phim này không tồn tại hoặc lỗi.
             </div>
=======
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import toast from 'react-hot-toast';
import { ArrowLeft, Play, Crown, Maximize, Minimize } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getMovieDetail } from '../services/api';
import { backendApi } from '../services/backendApi';
import { AppMovieDetail, AppEpisode } from '../types/movie';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';

type CustomArtplayer = Artplayer & {
  _introTimeValue?: number | null;
  _artMovieSlug?: string;
  _lastButtonType?: string | null;
  _introMarked?: boolean;
};

// Custom Wrapper for Artplayer + HLS.js
// Bulletproof architecture: tracks all network requests for instant abort on unmount
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArtPlayerWrapper = ({ url, playing, autoplay = true, onReady, onPlay, onPause, onSeek, onEnded, introTime, movieSlug: artMovieSlug, onIntroMarked }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const callbacks = useRef({ onReady, onPlay, onPause, onSeek, onEnded, onIntroMarked });

  // Track every XHR HLS.js spawns so we can abort them all on cleanup
  const pendingXHRs = useRef<Set<XMLHttpRequest>>(new Set());

  useEffect(() => {
    callbacks.current = { onReady, onPlay, onPause, onSeek, onEnded, onIntroMarked };
  }, [onReady, onPlay, onPause, onSeek, onEnded, onIntroMarked]);

  // Track mount lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ─── STANDALONE KILL FUNCTION ───────────────────────────────────────
  // Reads ONLY from refs → never stale, safe to call from anywhere.
  // Executes a 3-phase teardown: Network → Media → DOM
  const killPlayer = useCallback(() => {
    // ── PHASE 1: Aggressive Network Abort ──────────────────────────
    // Force-abort every tracked XMLHttpRequest (video chunks + JPEG sprites)
    pendingXHRs.current.forEach((xhr) => {
      try { xhr.abort(); } catch (_) { /* swallow */ }
    });
    pendingXHRs.current.clear();

    // Tear down HLS.js: stop loading → sever DOM link → destroy instance + worker
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      } catch (_) { /* swallow */ }
      hlsRef.current = null;
    }

    // ── PHASE 2: Kill Media Playback ───────────────────────────────
    if (artRef.current) {
      try {
        const video = artRef.current.video;
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load(); // Resets the media element's internal network/buffer state
        }
      } catch (_) { /* swallow */ }

      // Destroy ArtPlayer instance (false = don't try to remove container ourselves)
      try {
        artRef.current.destroy(false);
      } catch (_) { /* swallow */ }
      artRef.current = null;
    }

    // ── PHASE 3: Nuke the DOM Container ────────────────────────────
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    isInitialized.current = false;
  }, []);

  // Sync intro value onto the live ArtPlayer instance whenever the prop changes
  // This avoids closure staleness in the timeupdate handler
  useEffect(() => {
    if (artRef.current) {
      artRef.current._introTimeValue = introTime;
      // If intro was just set (e.g. after marking), flag it so the mark button hides
      if (introTime !== null && introTime !== undefined) {
        artRef.current._introMarked = true;
        artRef.current._lastButtonType = null; // force re-evaluation on next tick
      }
    }
  }, [introTime]);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    if (isInitialized.current) return;
    isInitialized.current = true;

    const art = new Artplayer({
      container: containerRef.current,
      url: url,
      // autoplay is false for guests — the Host's sync command will start them
      autoplay: autoplay,
      muted: false,
      fullscreen: true,
      setting: true,
      playbackRate: true,
      // CRITICAL: Suppress any poster/thumbnail that could trigger JPEG loads
      poster: '',
      customType: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m3u8: function playM3u8(video: any, src: string, player: any) {
          if (Hls.isSupported()) {
            // Clean up any prior HLS instance on this player
            if (hlsRef.current) {
              try {
                hlsRef.current.stopLoad();
                hlsRef.current.destroy();
              } catch (_) { /* swallow */ }
              hlsRef.current = null;
            }

            const hls = new Hls({
              // Disable Web Workers — prevents orphaned workers on fast unmount
              enableWorker: false,
              // Intercept every XHR that HLS.js creates (video chunks, key files,
              // I-frame playlists / JPEG sprite sheets) and register it for manual abort
              xhrSetup: (xhr: XMLHttpRequest) => {
                pendingXHRs.current.add(xhr);
                // Auto-remove from tracking set once the request settles
                xhr.addEventListener('loadend', () => {
                  pendingXHRs.current.delete(xhr);
                }, { once: true });
              },
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              // Only autoplay if allowed — guests must wait for the host's first sync
              if (isMounted.current && autoplay) {
                video.play().catch(() => {});
              }
            });

            // Store in ref — this is what killPlayer reads
            hlsRef.current = hls;
            player.hls = hls;

            // Backup: if ArtPlayer fires its own destroy event, also tear down HLS
            player.on('destroy', () => {
              if (hlsRef.current) {
                try {
                  hlsRef.current.stopLoad();
                  hlsRef.current.detachMedia();
                  hlsRef.current.destroy();
                } catch (_) { /* swallow */ }
                hlsRef.current = null;
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            player.notice.show = 'Unsupported playback format';
          }
        },
      },
    }) as CustomArtplayer;

    artRef.current = art;

    // ─── SKIP INTRO / MARK INTRO LAYER ──────────────────────────────
    // Inject a custom ArtPlayer layer that overlays the bottom-right.
    // Visibility is toggled by the timeupdate handler below.
    //
    // ArtPlayer's .art-layers container uses: position:absolute; inset:0;
    // display:flex; pointer-events:none. Individual .art-layer children
    // get pointer-events:auto. We position our inner container absolutely
    // within the full-size layer wrapper to place it at bottom-right.
    //
    // The `mounted` callback is the most reliable way to get a reference
    // to the injected DOM element — `add()` can return undefined if the
    // player's $parent isn't ready yet.
    let skipContainerEl: HTMLElement | null = null;

    art.layers.add({
      name: 'skipIntroLayer',
      html: '<div id="skip-intro-container" style="display:none; position:absolute; bottom:80px; right:20px; z-index:90; pointer-events:auto;"></div>',
      style: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      },
      mounted: ($el: HTMLElement) => {
        // $el is the wrapper <div class="art-layer art-layer-skipIntroLayer">
        // Our #skip-intro-container is inside it
        skipContainerEl = $el.querySelector('#skip-intro-container') as HTMLElement;
      },
    });

    // Helper: reliably find the skip-intro container element
    const getContainer = (): HTMLElement | null => {
      if (skipContainerEl) return skipContainerEl;
      // Fallback: search inside the player DOM
      const el = art.template?.$player?.querySelector?.('#skip-intro-container') as HTMLElement | null;
      if (el) skipContainerEl = el;
      return el;
    };

    // Build button HTML — we swap content based on state.
    // Uses innerHTML + addEventListener instead of inline onclick for security.
    const renderButton = (type: 'skip' | 'mark') => {
      const container = getContainer();
      if (!container) return;

      if (type === 'skip') {
        container.innerHTML = `
          <button id="skip-intro-btn" style="
            display: flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, rgba(229, 62, 62, 0.9), rgba(190, 24, 93, 0.85));
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: white; font-size: 14px; font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(229, 62, 62, 0.4);
            letter-spacing: 0.3px;
            animation: skipIntroFadeIn 0.3s ease-out;
          "
          onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 28px rgba(229,62,62,0.6)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(229,62,62,0.4)';"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
            Bỏ qua Intro
          </button>
        `;
        container.style.display = 'block';
        const btn = container.querySelector('#skip-intro-btn');
        if (btn) {
          btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            if (artRef.current) {
              artRef.current.currentTime = artRef.current._introTimeValue ?? 0;
            }
            container.style.display = 'none';
          });
        }
      } else if (type === 'mark') {
        container.innerHTML = `
          <button id="mark-intro-btn" style="
            display: flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, rgba(49, 130, 206, 0.85), rgba(56, 178, 172, 0.85));
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            color: white; font-size: 14px; font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(49, 130, 206, 0.4);
            letter-spacing: 0.3px;
            animation: skipIntroFadeIn 0.3s ease-out;
          "
          onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 28px rgba(49,130,206,0.6)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(49,130,206,0.4)';"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            Đánh dấu hết Intro
          </button>
        `;
        container.style.display = 'block';
        const btn = container.querySelector('#mark-intro-btn');
        if (btn) {
          btn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            if (artRef.current) {
              const markedTime = artRef.current.currentTime;
              artRef.current._introMarked = true; // immediately set local flag
              // Notify parent component
              if (callbacks.current.onIntroMarked) {
                callbacks.current.onIntroMarked(markedTime);
              }
              container.style.display = 'none';
            }
          });
        }
      }
    };

    // Inject the fadeIn animation keyframes into the player's shadow scope
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes skipIntroFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    art.template.$player.appendChild(styleTag);

    // Store intro value on the art instance so the timeupdate handler can read it
    // without closure staleness issues
    art._introTimeValue = introTime;
    art._artMovieSlug = artMovieSlug;
    art._lastButtonType = null as string | null;
    art._introMarked = false;

    // ─── TIME UPDATE HANDLER: Show/Hide Skip or Mark button ─────────
    art.on('video:timeupdate', () => {
      if (!isMounted.current || !artRef.current) return;
      const currentTime = art.currentTime;
      const currentIntro = art._introTimeValue;
      const container = getContainer();
      if (!container) return;

      if (currentIntro !== null && currentIntro !== undefined) {
        // ── Case A: Intro data exists ──
        if (currentTime < currentIntro) {
          if (art._lastButtonType !== 'skip') {
            renderButton('skip');
            art._lastButtonType = 'skip';
          }
        } else {
          if (art._lastButtonType !== null) {
            container.style.display = 'none';
            art._lastButtonType = null;
          }
        }
      } else {
        // ── Case B: No intro data — show Mark button in first 3 min ──
        if (!art._introMarked && currentTime < 180) {
          if (art._lastButtonType !== 'mark') {
            renderButton('mark');
            art._lastButtonType = 'mark';
          }
        } else {
          if (art._lastButtonType !== null) {
            container.style.display = 'none';
            art._lastButtonType = null;
          }
        }
      }
    });


    art.on('ready', () => {
      if (callbacks.current.onReady) {
        // Expose API that reads from REFS (not the closure `art` variable)
        // so the parent always talks to the live instance
        callbacks.current.onReady({
          getCurrentTime: () => artRef.current?.currentTime ?? 0,
          getDuration: () => artRef.current?.duration ?? 0,
          seekTo: (time: number) => { if (artRef.current) artRef.current.currentTime = time; },
          play: () => artRef.current?.play(),
          pause: () => artRef.current?.pause(),
          getPlaying: () => artRef.current?.playing ?? false,
          killPlayer, // Stable ref-based destroy — safe to call even after unmount starts
        });
      }
    });

    art.on('play', () => callbacks.current.onPlay?.());
    art.on('pause', () => callbacks.current.onPause?.());
    art.on('seek', () => callbacks.current.onSeek?.());
    art.on('video:ended', () => callbacks.current.onEnded?.());

    // React cleanup — if React unmounts us, kill everything
    return () => killPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, killPlayer]);

  useEffect(() => {
    if (artRef.current) {
      if (playing) {
        artRef.current.play().catch(() => {});
      } else {
        artRef.current.pause();
      }
    }
  }, [playing]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket: Socket = io(SOCKET_URL, { autoConnect: false });

export const WatchMovie = () => {
  const { movieSlug, episodeSlug } = useParams<{ movieSlug: string; episodeSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<AppMovieDetail | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<AppEpisode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<AppEpisode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // ── Crowdsourced Skip Intro State ─────────────────────────────────
  const [introTime, setIntroTime] = useState<number | null>(null);

  // Chunking State
  const CHUNK_SIZE = 100;
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);

  // Server State
  const [activeServerIndex, setActiveServerIndex] = useState(parseInt(searchParams.get('server') || '0', 10));

  // Room logic to reuse WatchRoom socket functionality
  const [roomId, setRoomId] = useState(searchParams.get('roomId') || '');

  // Video State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  // Start paused — Host's first sync command (or the host themselves) will start playback
  const [playing, setPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // ── Remote-Action Flag ─────────────────────────────────────────────────────
  // True when a command comes from the socket, to prevent triggering local events
  const isRemoteAction = useRef(false);

  // Throttle: timestamp of the last seek emit sent to the server
  const lastSeekEmitTime = useRef(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  const { user } = useAuthStore();
  const { addToHistory } = useUserStore();

  useEffect(() => {
    if (!roomId) {
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      // We could update URL search params here if we want to make it shareable, but since it's just xem-phim route, we can keep it hidden
    }
  }, [roomId]);

  // ── Fetch intro time from backend API (series only) ──
  useEffect(() => {
    if (!movieSlug || !movie || movie.type !== 'series') {
      setIntroTime(null);
      return;
    }
    const controller = new AbortController();
    backendApi.get(`/intro/${movieSlug}`, { signal: controller.signal })
      .then(res => {
        const data = res.data;
        if (data && data.introEndTime > 0) {
          setIntroTime(data.introEndTime);
          console.log(`[SkipIntro] Loaded intro time for "${movieSlug}": ${data.introEndTime}s`);
        } else {
          setIntroTime(null);
        }
      })
      .catch(() => setIntroTime(null));
    return () => controller.abort();
  }, [movieSlug, movie]);

  // ── Handler: when user marks intro end (saves to backend API) ──────
  const handleIntroMarked = useCallback((time: number) => {
    setIntroTime(time);
    toast.success(`Đã đánh dấu hết Intro tại ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`, {
      icon: '🎬',
      duration: 4000,
    });
    // Persist to backend (fire-and-forget — local state already updated)
    if (movieSlug) {
      backendApi.post('/intro', { movieSlug, introEndTime: time })
        .catch(err => console.warn('[SkipIntro] Failed to save intro time:', err.message));
    }
  }, [movieSlug]);

  // Fetch Movie Data
  useEffect(() => {
    if (!movieSlug) return;

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const detail = await getMovieDetail(movieSlug);
        setMovie(detail);

        if (detail.episodes && detail.episodes.length > 0) {
          // Verify activeServerIndex is valid
          const validServerIndex = activeServerIndex >= detail.episodes.length ? 0 : activeServerIndex;
          if (validServerIndex !== activeServerIndex) {
            setActiveServerIndex(validServerIndex);
          }
          
          const eps = detail.episodes[validServerIndex].episodes;
          setAllEpisodes(eps);
          
          if (eps.length > 0) {
            let found = eps.find(e => e.slug === episodeSlug);
            if (!found) {
              // If invalid episodeSlug, redirect to the first episode of this server
              found = eps[0];
              navigate(`/xem-phim/${movieSlug}/${found.slug}?server=${validServerIndex}`, { replace: true });
              return;
            }
            setCurrentEpisode(found);
            setVideoUrl(found.linkM3u8);
          }
        }
      } catch (err) {
        console.error('Failed to fetch movie', err);
        toast.error('Không thể tải phim');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieSlug, episodeSlug, navigate, activeServerIndex]);

  // Save Watch Progress
  useEffect(() => {
    if (!playing || !user || !movie || !currentEpisode) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration() || 2700;
        
        addToHistory(movie, currentEpisode.name, currentEpisode.slug, time, duration);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [playing, user, movie, currentEpisode, addToHistory]);

  // Smart Resume Logic
  const hasResumed = useRef(false);
  const { history } = useUserStore();

  useEffect(() => {
    hasResumed.current = false;
  }, [episodeSlug]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current && !hasResumed.current && user) {
      const historyItem = history.find(h => h.movieSlug === movieSlug && h.episodeSlug === episodeSlug);
      if (historyItem && historyItem.currentTime > 0) {
        playerRef.current.seekTo(historyItem.currentTime);
        
        const m = Math.floor(historyItem.currentTime / 60);
        const s = Math.floor(historyItem.currentTime % 60);
        const formatTime = `${m}:${s < 10 ? '0' : ''}${s}`;
        toast(`Tiếp tục xem từ phút ${formatTime}`, { icon: '▶️', duration: 4000 });
        
        hasResumed.current = true;
      }
    }
  }, [isPlayerReady, movieSlug, episodeSlug, history, user]);

  // Episode Chunking Logic
  const episodeChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < allEpisodes.length; i += CHUNK_SIZE) {
      chunks.push(allEpisodes.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [allEpisodes]);

  useEffect(() => {
    if (allEpisodes.length > 0 && episodeSlug) {
      const index = allEpisodes.findIndex(ep => ep.slug === episodeSlug);
      if (index !== -1) {
        setActiveChunkIndex(Math.floor(index / CHUNK_SIZE));
      }
    }
  }, [allEpisodes, episodeSlug]);

  // Socket Initialization
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

    // ── Role Assignment ─────────────────────────────────────────────────────
    const onHostStatus = ({ isHost: hostRole }: { isHost: boolean }) => {
      setIsHost(hostRole);

      if (!hostRole) {
        // Guest: immediately request the host's current state so we start in sync
        socket.emit('guest-request-sync', { roomId });
      } else {
        // Host: start playing as soon as they are ready
        setPlaying(true);
      }
    };

    // ── Initial Sync: Host → this Guest only ────────────────────────────────
    const onHostForceSync = ({ time, isPlaying }: { time: number; isPlaying: boolean }) => {
      if (!playerRef.current) return;
      isRemoteAction.current = true;
      playerRef.current.seekTo(time);
      if (isPlaying) {
        playerRef.current.play();
        setPlaying(true);
      } else {
        playerRef.current.pause();
        setPlaying(false);
      }
      isRemoteAction.current = false;
    };

    // ── Host receives this: a guest needs their current state ───────────────
    const onGuestRequestSync = ({ guestId }: { guestId: string }) => {
      if (!playerRef.current) return;
      socket.emit('host-force-sync', {
        roomId,
        guestId,
        time: playerRef.current.getCurrentTime(),
        isPlaying: playerRef.current.getPlaying(),
      });
    };

    // ── Ongoing Sync Commands (Host → All Guests) ───────────────────────────
    const onSyncPlay = ({ time }: { time: number }) => {
      if (!playerRef.current) return;
      isRemoteAction.current = true;
      const diff = Math.abs(playerRef.current.getCurrentTime() - time);
      if (diff > 0.5) playerRef.current.seekTo(time);
      playerRef.current.play();
      setPlaying(true);
      isRemoteAction.current = false;
    };

    const onSyncPause = ({ time }: { time: number }) => {
      if (!playerRef.current) return;
      isRemoteAction.current = true;
      const diff = Math.abs(playerRef.current.getCurrentTime() - time);
      if (diff > 0.5) playerRef.current.seekTo(time);
      playerRef.current.pause();
      setPlaying(false);
      isRemoteAction.current = false;
    };

    const onSyncSeek = ({ time }: { time: number }) => {
      if (!playerRef.current) return;
      isRemoteAction.current = true;
      playerRef.current.seekTo(time);
      isRemoteAction.current = false;
    };

    socket.on('host-status', onHostStatus);
    socket.on('host-force-sync', onHostForceSync);
    socket.on('guest-request-sync', onGuestRequestSync);
    socket.on('sync-play', onSyncPlay);
    socket.on('sync-pause', onSyncPause);
    socket.on('sync-seek', onSyncSeek);

    // CRITICAL: Always clean up listeners to prevent duplicates on hot-reload
    return () => {
      socket.emit('leaveRoom', roomId);
      socket.off('connect', handleConnect);
      socket.off('host-status', onHostStatus);
      socket.off('host-force-sync', onHostForceSync);
      socket.off('guest-request-sync', onGuestRequestSync);
      socket.off('sync-play', onSyncPlay);
      socket.off('sync-pause', onSyncPause);
      socket.off('sync-seek', onSyncSeek);
      socket.disconnect();
    };
  }, [roomId]);

  // ── Video Event Handlers (Host → Socket) ──────────────────────────────────
  //
  // Only the HOST emits sync commands. Guests' local events are silently
  // swallowed via remote flags — they NEVER send socket events.

  const handlePlay = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) return;

    // Guests cannot initiate play
    if (!isHost) return;

    setPlaying(true);
    const time = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('sync-play', { roomId, time });
  }, [isPlayerReady, roomId, isHost]);

  const handlePause = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) return;

    // Guests cannot initiate pause
    if (!isHost) return;

    setPlaying(false);
    const time = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('sync-pause', { roomId, time });
  }, [isPlayerReady, roomId, isHost]);

  const handleSeek = useCallback(() => {
    if (!isPlayerReady) return;
    if (isRemoteAction.current) return;

    // Guests cannot seek
    if (!isHost) return;

    // Throttle: emit at most once every 2 seconds
    const now = Date.now();
    if (now - lastSeekEmitTime.current < 2000) return;
    lastSeekEmitTime.current = now;

    const time = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    socket.emit('sync-seek', { roomId, time });
  }, [isPlayerReady, roomId, isHost]);

  const handleVideoEnded = useCallback(() => {
    if (!allEpisodes || allEpisodes.length === 0) return;
    const currentIndex = allEpisodes.findIndex(ep => ep.slug === episodeSlug);
    if (currentIndex !== -1 && currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      navigate(`/xem-phim/${movieSlug}/${nextEpisode.slug}?server=${activeServerIndex}`, { replace: true });
    }
  }, [allEpisodes, episodeSlug, movieSlug, navigate, activeServerIndex]);

  const handleEpisodeClick = (epSlug: string) => {
    // URL update -> triggers useEffect -> fetches new m3u8 and updates videoUrl
    navigate(`/xem-phim/${movieSlug}/${epSlug}?server=${activeServerIndex}`, { replace: true });
  };

  if (loading && !movie) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white pt-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Đang tải phim...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark pt-16">
      {/* Left Column - Video Player Area */}
      <div className={`flex-1 flex flex-col relative bg-black transition-all duration-300 ${isTheaterMode ? 'w-full' : 'lg:w-3/4 xl:w-4/5'}`}>
        <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-auto transition-opacity duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                // ── SYNCHRONOUS KILL: All resources must die BEFORE navigation ──
                
                // 1. Kill the player via the ref-based killPlayer (aborts all XHRs,
                //    destroys HLS.js, nukes ArtPlayer, clears DOM)
                if (playerRef.current?.killPlayer) {
                  playerRef.current.killPlayer();
                }

                // 2. Safety net: force-kill any remaining <video>/<audio> elements
                //    that might have escaped the player wrapper (e.g., ArtPlayer clones)
                document.querySelectorAll('video, audio').forEach((el) => {
                  const media = el as HTMLMediaElement;
                  media.pause();
                  media.removeAttribute('src');
                  media.load();
                });

                // 3. Navigate immediately — no setTimeout needed because all
                //    network activity and media playback is already dead
                navigate(`/phim/${movieSlug}`);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-sm"
              title="Quay lại chi tiết phim"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-lg z-50 drop-shadow-md leading-tight truncate max-w-[300px] md:max-w-md">
                {movie?.title} {currentEpisode ? `- ${currentEpisode.name}` : ''}
              </h1>
              {currentEpisode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary font-medium">{currentEpisode.name}</span>
                  {isHost && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" />
                      Host
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-sm mr-2"
            title={isTheaterMode ? "Thoát Theater Mode" : "Theater Mode"}
          >
            {isTheaterMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>

        <div className={`flex-1 relative ${!isHost && isPlayerReady ? 'pointer-events-none' : ''}`}>
          {videoUrl ? (
            <ArtPlayerWrapper
              url={videoUrl}
              playing={playing}
              // Host autoplays; guests start paused and wait for the initial sync command
              autoplay={isHost}
              // ── Skip Intro props ──
              introTime={movie?.type === 'series' ? introTime : null}
              movieSlug={movieSlug}
              onIntroMarked={handleIntroMarked}
              // We also have the pointer-events-none on the wrapper div above for safety
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onEnded={handleVideoEnded}
              onReady={(instance: any) => {
                playerRef.current = instance;
                setIsPlayerReady(true);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-black pointer-events-auto">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p>Đang tải video streaming...</p>
            </div>
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Movie Info Short */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-6 mb-8">
         <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>
         <p className="text-gray-400 text-sm">Đang xem: <span className="text-primary font-semibold">{selectedEpisode?.name}</span></p>
      </div>

      {/* Episode List */}
      {movie.episodes.length > 0 && (
        <motion.div
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 md:px-12 mt-8"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MonitorPlay className="w-5 h-5 text-primary" />
            Chọn tập phim
          </h3>

          {/* Server tabs */}
          {movie.episodes.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {movie.episodes.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServer(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeServer === idx
=======
      {/* Right Column - Episode Sidebar */}
      {!isTheaterMode && (
        <div className="w-full lg:w-1/4 xl:w-1/5 bg-dark-light border-l border-white/5 flex flex-col shrink-0 lg:h-[calc(100vh-64px)] overflow-hidden transition-all duration-300">
          <div className="p-4 border-b border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-white mb-1">Danh sách tập phim</h2>
            <p className="text-xs text-gray-400">{allEpisodes.length} tập</p>
          </div>
          
          {movie && movie.episodes.length > 1 && (
            <div className="w-full overflow-hidden border-b border-white/10">
              <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-2 p-3 scrollbar-hide">
                {movie.episodes.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveServerIndex(idx);
                    // navigate to first episode of new server to avoid invalid episode slug
                    const newEps = server.episodes;
                    if (newEps.length > 0) {
                      navigate(`/xem-phim/${movieSlug}/${newEps[0].slug}?server=${idx}`, { replace: true });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeServerIndex === idx
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {server.serverName}
                </button>
              ))}
<<<<<<< HEAD
            </div>
          )}

          {/* Episode grid */}
          {currentServer && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
              {currentServer.episodes.map((ep) => {
                const isActive = selectedEpisode?.slug === ep.slug;
                return (
                  <button
                    key={ep.slug}
                    onClick={() => handlePlayEpisode(ep.slug)}
                    className={`relative px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-[1.02]'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-white'
                    }`}
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-center gap-1.5">
                      {isActive && <Play className="w-3 h-3 fill-white" />}
                      <span className="truncate">{ep.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
=======
              </div>
            </div>
          )}

          {episodeChunks.length > 1 && (
            <div className="w-full overflow-hidden border-b border-white/10">
              <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-2 p-3 scrollbar-hide">
                {episodeChunks.map((chunk, index) => {
                const start = index * CHUNK_SIZE + 1;
                const end = start + chunk.length - 1;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveChunkIndex(index)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeChunkIndex === index
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {start}-{end}
                  </button>
                );
              })}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {episodeChunks[activeChunkIndex]?.map((ep) => {
              const isActive = ep.slug === episodeSlug;
              return (
                <button
                  key={ep.slug}
                  onClick={() => handleEpisodeClick(ep.slug)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    isActive 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'bg-white/5 hover:bg-white/10 border-l-4 border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-300 group-hover:text-white'}`}>
                    {ep.name}
                  </span>
                  {isActive && <Play className="w-4 h-4 text-primary fill-primary" />}
                </button>
              );
            })}
          </div>
        </div>
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
      )}
    </div>
  );
};
