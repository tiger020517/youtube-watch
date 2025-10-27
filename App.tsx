import { useState } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { ChatBox } from './components/ChatBox';
import { UserList } from './components/UserList';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { useRoom } from './hooks/useRoom';

const MAIN_ROOM_ID = 'main';

export default function App() {
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');

  const { videoState, messages, users, isConnected, updateVideoState, sendMessage } = useRoom(MAIN_ROOM_ID, userName);

  const handleSetName = () => {
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setShowNameDialog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSetName();
    }
  };

  const handleVideoChange = (videoId: string) => {
    updateVideoState({ video_id: videoId, is_playing: false, current_time: 0 });
  };

  const handlePlay = () => {
    updateVideoState({ is_playing: true });
  };

  const handlePause = (time: number) => {
    updateVideoState({ is_playing: false, current_time: time });
  };

  const handleSeek = (time: number) => {
    updateVideoState({ current_time: time });
  };

  const handleTimeUpdate = (time: number) => {
    updateVideoState({ current_time: time});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환영합니다!</DialogTitle>
            <DialogDescription>
              함께 시청하기 전에 이름을 입력해주세요
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Input
              type="text"
              placeholder="이름을 입력하세요"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <Button onClick={handleSetName}>시작하기</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-gray-900 mb-2">YouTube 함께보기</h1>
          <p className="text-gray-600">친구들과 함께 영상을 시청하고 채팅해보세요</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4">
              <VideoPlayer 
                key={videoState.video_id}
                video_id={videoState.video_id}
                is_playing={videoState.is_playing}
                current_time={videoState.current_time}
                onVideoChange={handleVideoChange}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                onTimeUpdate={handleTimeUpdate}
                isSynced={isConnected}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-[300px] lg:h-[400px]">
              <UserList users={users} currentUser={userName} />
            </Card>
            
            <Card className="h-[400px] lg:h-[500px]">
              <ChatBox 
                currentUser={userName}
                messages={messages}
                onSendMessage={sendMessage}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
