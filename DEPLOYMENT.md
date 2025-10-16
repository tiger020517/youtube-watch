# 배포 가이드

이 가이드는 YouTube 함께보기 앱을 GitHub에 올리고 배포하는 방법을 설명합니다.

## 1. GitHub에 업로드하기

### 방법 1: GitHub Desktop 사용 (초보자 추천)

1. [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. GitHub 계정으로 로그인
3. File > New Repository 클릭
4. Repository name: `youtube-watch-together` (원하는 이름)
5. Local path: 프로젝트 폴더 선택
6. "Create Repository" 클릭
7. "Publish repository" 클릭

### 방법 2: 명령줄 사용

```bash
# 프로젝트 폴더로 이동
cd your-project-folder

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit"

# GitHub에서 새 repository 생성 후
git remote add origin https://github.com/your-username/your-repo-name.git

# 푸시
git branch -M main
git push -u origin main
```

## 2. Supabase 설정

### Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 계정 생성/로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. Region 선택 (가까운 지역 추천)
5. "Create new project" 클릭

### 환경 변수 가져오기

1. Supabase 대시보드에서 Settings > API 클릭
2. 다음 정보 복사:
   - Project URL
   - anon/public key

### Edge Function 배포

```bash
# Supabase CLI 설치 (한 번만)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# Edge Function 배포
supabase functions deploy server
```

**중요**: Edge Function 배포 후 환경 변수 설정:

```bash
supabase secrets set SUPABASE_URL=your-supabase-url
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Realtime 활성화

1. Supabase 대시보드 > Database > Replication
2. `kv_store_cce49a7b` 테이블에서 Realtime 활성화

## 3. Netlify로 배포

### Netlify 설정

1. [Netlify](https://netlify.com)에서 계정 생성/로그인
2. "Add new site" > "Import an existing project" 클릭
3. GitHub 연결 및 저장소 선택
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables 추가:
   ```
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
6. "Deploy site" 클릭

### 배포 완료 후

1. Netlify에서 생성된 URL 확인 (예: https://your-app.netlify.app)
2. 친구들과 URL 공유!

## 4. Vercel로 배포 (대안)

1. [Vercel](https://vercel.com)에서 계정 생성/로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. Environment variables 추가:
   ```
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. "Deploy" 클릭

## 5. 로컬에서 개발하기

```bash
# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env

# .env 파일 편집하여 Supabase 정보 입력

# 개발 서버 실행
npm run dev
```

## 문제 해결

### "Room not found" 오류
- Supabase Edge Function이 제대로 배포되었는지 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 동기화가 작동하지 않음
- Supabase Realtime이 활성화되어 있는지 확인
- 브라우저 콘솔에서 에러 확인

### 빌드 실패
- `node_modules` 폴더 삭제 후 `npm install` 재실행
- Node.js 버전이 18 이상인지 확인

## 추가 도움말

- [Supabase 문서](https://supabase.com/docs)
- [Netlify 문서](https://docs.netlify.com)
- [Vercel 문서](https://vercel.com/docs)
