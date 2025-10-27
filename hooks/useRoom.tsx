import { useState, useEffect, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Message, User, VideoState } from '../types'; // 통합된 타입 사용

// Supabase 클라이언트 초기화
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

// 커스텀 훅 정의
export function useRoom(roomId: string | null, userName: string) {
  // 상태 변수 정의
  const [videoState, setVideoState] = useState<VideoState>({
    id: roomId || 'main',
    video_id: 'dQw4w9WgXcQ', // 기본 비디오 ID
    is_playing: false,
    current_time: 0,
    last_update: new Date().toISOString(),
  });  
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // [수정] 비디오 상태 업데이트 함수
  const updateVideoState = useCallback(async (updates: Partial<VideoState>) => {
    if (!roomId) return;
    
    // fetch 대신 Supabase 클라이언트를 직접 사용하여 'rooms' 테이블 업데이트
    const { error } = await supabase
      .from('rooms')
      .update({ ...updates, last_update: new Date().toISOString() })
      .eq('id', roomId);

    if (error) console.error('Error updating video state:', error);
  }, [roomId]);

  // [수정] 메시지 보내기 함수
  const sendMessage = useCallback(async (text: string) => {
    if (!roomId || !userName || !text.trim()) return;

    // fetch 대신 Supabase 클라이언트를 직접 사용하여 'messages' 테이블에 삽입
    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user: userName,
      text: text.trim(),
    });

    if (error) console.error('Error sending message:', error);
  }, [roomId, userName]);

  // [수정] Realtime 구독 및 Presence 로직
  useEffect(() => {
    if (!roomId || !userName) return;

    let channel: RealtimeChannel;

    // 초기 데이터 로드 및 Realtime 채널 설정
    const setupRoom = async () => {
      // 1. 초기 비디오 상태 및 메시지 로드
      const [roomRes, messagesRes] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('messages').select('*').eq('room_id', roomId).order('timestamp', { ascending: true })
      ]);

      if (roomRes.data) setVideoState(roomRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);

      // 2. Realtime 채널 생성
      channel = supabase.channel(`room:${roomId}`, {
        config: {
          presence: {
            key: userName, // 각 사용자를 이름으로 식별
          },
        },
      });

      // 3. 비디오 상태(rooms 테이블) 변경 구독
      channel.on<VideoState>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          console.log('Video state updated!', payload.new);
          setVideoState(payload.new);
        }
      );

      // 4. 메시지(messages 테이블) 추가 구독
      channel.on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('New message received!', payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      );

      // 5. 사용자 목록(Presence) 구독
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState<User>();
        const userList = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId] as unknown as User[];
            return presences[0];
          })
          .filter(Boolean); // undefined 제거
        setUsers(userList);
      });
      
      // 6. 채널 최종 구독 및 내 상태 알리기
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // 내가 방에 참여했음을 알림 (다른 사람들에게 내 정보가 보임)
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user.id || userName; // user.id가 없으면 userName을 고유값으로 사용
          await channel.track({
            id: userId,
            name: userName,
            status: 'watching',
          });
        }
      });
    };

    setupRoom();

    // 컴포넌트 언마운트 시 채널 구독 해제
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId, userName]);

  // 훅이 반환하는 값들
  return {
    videoState,
    messages,
    users,
    isConnected,
    updateVideoState,
    sendMessage,
  };
}

/*import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

interface VideoState {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  lastUpdate: number;
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'watching';
  lastSeen: number;
}

export function useRoom(roomId: string | null, userName: string) {
  const [videoState, setVideoState] = useState<VideoState>({
    videoId: 'dQw4w9WgXcQ',
    isPlaying: false,
    currentTime: 0,
    lastUpdate: Date.now()
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const presenceIntervalRef = useRef<number | null>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cce49a7b`;

  // Fetch room data
  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideoState(data.room);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }, [roomId, serverUrl]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [roomId, serverUrl]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}/users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [roomId, serverUrl]);

  // Update video state
  const updateVideoState = useCallback(async (updates: Partial<VideoState>) => {
    if (!roomId) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setVideoState(data.room);
      }
    } catch (error) {
      console.error('Error updating video state:', error);
    }
  }, [roomId, serverUrl]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!roomId || !text.trim()) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          user: userName,
          text: text.trim()
        })
      });

      if (response.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [roomId, userName, serverUrl, fetchMessages]);

  // Update user presence
  const updatePresence = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${serverUrl}/room/${roomId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userId,
          name: userName,
          status: 'watching'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (!userId) {
          setUserId(data.user.id);
        }
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [roomId, userId, userName, serverUrl, fetchUsers]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kv_store_cce49a7b',
          filter: `key=like.room:${roomId}%`
        },
        (payload) => {
          if ('key' in payload.new && typeof payload.new.key === 'string') 
          {
            // Refresh data when any change occurs
            if (payload.new.key === `room:${roomId}`) {
              fetchRoomData();
            } else if (payload.new.key.includes(':message:')) {
              fetchMessages();
            } else if (payload.new.key.includes(':user:')) {
              fetchUsers();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchRoomData, fetchMessages, fetchUsers]);

  // Initial fetch and presence setup
  useEffect(() => {
    if (!roomId) return;

    fetchRoomData();
    fetchMessages();
    updatePresence();

    // Update presence every 10 seconds
    presenceIntervalRef.current = window.setInterval(() => {
      updatePresence();
    }, 10000);

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
    };
  }, [roomId, fetchRoomData, fetchMessages, updatePresence]);

  return {
    videoState,
    messages,
    users,
    isConnected,
    updateVideoState,
    sendMessage,
  };
}
*/