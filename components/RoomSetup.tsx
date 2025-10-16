import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Plus } from 'lucide-react';

interface RoomSetupProps {
  isOpen: boolean;
  onCreateRoom: (userName: string) => void;
  onJoinRoom: (userName: string, roomId: string) => void;
}

export function RoomSetup({ isOpen, onCreateRoom, onJoinRoom }: RoomSetupProps) {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const handleCreateRoom = () => {
    if (userName.trim()) {
      onCreateRoom(userName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim() && roomId.trim()) {
      onJoinRoom(userName.trim(), roomId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'join') => {
    if (e.key === 'Enter') {
      if (action === 'create') {
        handleCreateRoom();
      } else {
        handleJoinRoom();
      }
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>YouTube 함께보기</DialogTitle>
          <DialogDescription>
            새 방을 만들거나 친구의 방에 참가하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              방 만들기
            </TabsTrigger>
            <TabsTrigger value="join" className="gap-2">
              <Users className="w-4 h-4" />
              참가하기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">이름</Label>
              <Input
                id="create-name"
                type="text"
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'create')}
                autoFocus
              />
            </div>
            <Button onClick={handleCreateRoom} className="w-full">
              방 만들기
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="join-name">이름</Label>
              <Input
                id="join-name"
                type="text"
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-id">방 코드</Label>
              <Input
                id="room-id"
                type="text"
                placeholder="방 코드를 입력하세요"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toLowerCase())}
                onKeyPress={(e) => handleKeyPress(e, 'join')}
              />
            </div>
            <Button onClick={handleJoinRoom} className="w-full">
              참가하기
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
