import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, Tv } from 'lucide-react';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';

interface VideoPlayerProps {
  video_id: string;
  is_playing: boolean;
  current_time: number;
  onVideoChange?: (videoId: string) => void;
  onPlay?: () => void;
  onPause?: (currentTime: number) => void;
  onSeek?: (time: number) => void;
  onTimeUpdate?: (time: number) => void;
  isSynced?: boolean;
}

export function VideoPlayer({ 
  video_id: videoId, 
  is_playing: isPlaying, 
  current_time: currentTime,
  onVideoChange, 
  onPlay, 
  onPause,
  onSeek,
  onTimeUpdate,
  isSynced = true
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [localCurrentTime, setLocalCurrentTime] = useState(currentTime);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(14, 5);
  }

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

  const onPlayerReady: YouTubeProps['onReady'] = async (event) => {
    playerRef.current = event.target;
    const duration = await event.target.getDuration();
    setVideoDuration(duration);
    setIsReady(true);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1 && !isPlaying) {
      onPlay?.();
    } else if (event.data === 2 && isPlaying) {
      playerRef.current?.getCurrentTime().then((time: number) => {
        setLocalCurrentTime(time);
        onPause?.(time || 0);
      });
    } else if (event.data === 0) {
      onPause?.(videoDuration);
      setLocalCurrentTime(videoDuration);
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
    if (!playerRef.current || !isReady || isSeeking) return;

    const syncTime = async () => {
      const currentPlayerTime = await playerRef.current!.getCurrentTime();
      const timeDiff = Math.abs(currentPlayerTime - currentTime);
      
      // Only sync if difference is more than 2 seconds to avoid constant adjustments
      if (timeDiff > 2) {
        playerRef.current!.seekTo(currentTime, true);
      }
      else if (!isPlaying && timeDiff > 0.5) {
        playerRef.current!.seekTo(currentTime, true);
        setLocalCurrentTime(currentTime);
      }
    };
    syncTime();
  }, [currentTime, isReady, isPlaying, isSeeking]);

  useEffect(() => {
    if (!isReady || !isPlaying || !onTimeUpdate || isSeeking) return ;

    const intervalId = setInterval(async () => {
      if (playerRef.current) {
        const time = await playerRef.current.getCurrentTime();
        onTimeUpdate(time);
      }
    }, 3000)
    return () => {
      clearInterval(intervalId);
    };
  }, [isReady, isPlaying, onTimeUpdate, isSeeking]);

  useEffect(() => {
    if (!isReady || !isPlaying || !playerRef.current) return;

    const intervalId = setInterval(async () => {
      if (!isSeeking) {
        const time = await playerRef.current!.getCurrentTime();
        setLocalCurrentTime(time);
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, [isReady, isPlaying, isSeeking]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      const currentTime = await playerRef.current?.getCurrentTime();
      onPause?.(currentTime || 0);
    } else {
      onPlay?.();
    }
  };

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.getCurrentTime().then((time: number) => {
        const newTime = Math.max(0, time + seconds);
        playerRef.current?.seekTo(newTime, true);
        setLocalCurrentTime(newTime);
        onSeek?.(newTime);
      });
    }
  };

  /** 사용자가 슬라이더를 드래그하는 동안 호출됩니다. */
  const handleSeekChange = (value: number[]) => {
    setIsSeeking(true); // '잡고 있음' 상태로 변경
    setLocalCurrentTime(value[0]); // UI만 즉시 업데이트
  };

  /** 사용자가 슬라이더를 놓거나 클릭했을 때 호출됩니다. */
  const handleSeekCommit = (value: number[]) => {
    const newTime = value[0];
    setLocalCurrentTime(newTime);
    playerRef.current?.seekTo(newTime, true); // 내 플레이어 즉시 이동
    onSeek?.(newTime); // 서버(다른 사용자)에게 동기화 요청
    setIsSeeking(false); // '놓음' 상태로 변경
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      origin: window.location.origin,
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

      <div className="flex items-center gap-2 px-1">
        <span className="text-sm text-gray-700 w-12 text-center">
          {formatTime(localCurrentTime)}
        </span>
        <Slider
          value={[localCurrentTime]}
          max={videoDuration}
          step={1}
          onValueChange={handleSeekChange} // 드래그 중
          onValueCommit={handleSeekCommit} // 드래그 완료
          disabled={!isReady}
          className="flex-1"
        />
        <span className="text-sm text-gray-700 w-12 text-center">
          {formatTime(videoDuration)}
        </span>
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
