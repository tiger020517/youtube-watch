import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface ChatBoxProps {
  currentUser: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function ChatBox({ currentUser, messages, onSendMessage }: ChatBoxProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3>채팅</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className={message.user === currentUser ? 'text-blue-600' : 'text-gray-700'}>
                  {message.user}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="text-gray-800 break-words">{message.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
