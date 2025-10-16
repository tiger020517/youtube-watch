import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, Tv } from 'lucide-react';
import { Badge } from './ui/badge';

interface VideoPlayerProps {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  onVideoChange?: (videoId: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  isSynced?: boolean;
}

export function VideoPlayer({ 
  videoId, 
  isPlaying, 
  currentTime,
  onVideoChange, 
  onPlay, 
  onPause,
  onSeek,
  isSynced = true
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleLoadVideo = () => {
    const extractedId = extractVideoId(videoUrl);
    if (extractedId) {
      onVideoChange?.(extractedId);
      setVideoUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadVideo();
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsReady(true);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1 && !isPlaying) {
      onPlay?.();
    } else if (event.data === 2 && isPlaying) {
      onPause?.();
    }
  };

  // Sync player state with props
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    const syncPlayer = async () => {
      const playerState = await playerRef.current!.getPlayerState();
      
      if (isPlaying && playerState !== 1) {
        playerRef.current!.playVideo();
      } else if (!isPlaying && playerState === 1) {
        playerRef.current!.pauseVideo();
      }
    };

    syncPlayer();
  }, [isPlaying, isReady]);

  // Sync current time
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    const syncTime = async () => {
      const currentPlayerTime = await playerRef.current!.getCurrentTime();
      const timeDiff = Math.abs(currentPlayerTime - currentTime);
      
      // Only sync if difference is more than 2 seconds to avoid constant adjustments
      if (timeDiff > 2) {
        playerRef.current!.seekTo(currentTime, true);
      }
    };

    syncTime();
  }, [currentTime, isReady]);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.getCurrentTime().then((time) => {
        const newTime = Math.max(0, time + seconds);
        onSeek?.(newTime);
      });
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="YouTube URL 또는 비디오 ID를 입력하세요"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleLoadVideo} className="gap-2">
          <Tv className="w-4 h-4" />
          변경
        </Button>
        {isSynced && (
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            동기화됨
          </Badge>
        )}
      </div>
      
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute top-0 left-0 w-full h-full">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleSkip(-10)}
          disabled={!isReady}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          size="icon"
          onClick={handlePlayPause}
          disabled={!isReady}
          className="w-12 h-12"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleSkip(10)}
          disabled={!isReady}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
