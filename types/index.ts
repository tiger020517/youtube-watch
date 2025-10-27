// src/types/index.ts

// 채팅 메시지를 위한 타입
export interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string; // Supabase의 timestamtamptz는 string 형태입니다.
  room_id: string;
}

// 비디오 상태 공유를 위한 타입 (Supabase의 'rooms' 테이블 구조와 일치)
export interface VideoState {
  id: string;
  video_id: string;
  is_playing: boolean;
  current_time: number;
  last_update: string;
}

// 사용자 목록 (Presence)을 위한 타입
export interface User {
  id: string; // 사용자의 고유 ID
  name: string; // 사용자가 입력한 이름
  status: 'online' | 'watching';
}