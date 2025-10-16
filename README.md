# YouTube 함께보기

친구들과 함께 YouTube 영상을 실시간으로 시청할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🎥 **실시간 동기화**: 모든 사용자가 같은 영상의 같은 부분을 시청
- 💬 **실시간 채팅**: 영상을 보면서 실시간으로 채팅
- 👥 **사용자 목록**: 현재 시청 중인 사용자 확인
- 🎮 **재생 컨트롤**: 재생/일시정지, 10초 앞뒤로 이동

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (실시간 동기화, 데이터베이스)
- **UI Components**: shadcn/ui
- **Video Player**: react-youtube

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone <your-repo-url>
cd youtube-watch-together
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 개발 서버 실행
```bash
npm run dev
```

### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 anon key를 `.env` 파일에 추가
3. Supabase 대시보드에서 Realtime 활성화

### 배포

#### Netlify로 배포

1. GitHub에 코드 푸시
2. [Netlify](https://netlify.com)에 로그인
3. "New site from Git" 선택
4. GitHub 저장소 연결
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Environment variables 추가 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
7. Deploy!

#### Vercel로 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 선택
4. GitHub 저장소 연결
5. Environment variables 추가
6. Deploy!

## 사용 방법

1. 웹사이트 접속
2. 이름 입력
3. 친구들이 같은 링크로 접속
4. YouTube URL 입력 또는 비디오 ID 입력
5. 함께 시청 시작!

## 라이선스

MIT

## 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!
