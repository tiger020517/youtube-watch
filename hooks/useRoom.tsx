import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
