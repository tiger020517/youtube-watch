# 빠른 Import 수정 가이드

## 문제
Figma Make 환경은 버전이 명시된 import를 사용하지만, 일반 Node.js/Vite 환경에서는 작동하지 않습니다.

## 해결 방법 (가장 빠름!)

### 방법 1: VS Code에서 한 번에 수정 (추천!)

1. VS Code에서 프로젝트 열기
2. `Cmd+Shift+F` (Mac) 또는 `Ctrl+Shift+F` (Windows) - 전체 검색
3. **"검색"** 탭에서 **정규식 모드** 활성화 (.*  버튼 클릭)

#### 각각 검색 후 바꾸기:

**1단계: @radix-ui 수정**
```
검색: @radix-ui/([a-z-]+)@[\d.]+
바꾸기: @radix-ui/$1
```
"Replace All" 클릭

**2단계: class-variance-authority 수정**
```
검색: class-variance-authority@[\d.]+
바꾸기: class-variance-authority
```
"Replace All" 클릭

**3단계: lucide-react 수정**
```
검색: lucide-react@[\d.]+
바꾸기: lucide-react
```
"Replace All" 클릭

**4단계: sonner 수정**
```
검색: sonner@[\d.]+
바꾸기: sonner
```
"Replace All" 클릭

**5단계: next-themes 수정**
```
검색: next-themes@[\d.]+
바꾸기: next-themes
```
"Replace All" 클릭

---

### 방법 2: 터미널 명령어 (Mac/Linux)

```bash
# components/ui 디렉토리로 이동
cd components/ui

# 각 패턴 수정
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@radix-ui\/\([a-z-]*\)@[0-9.]*/@radix-ui\/\1/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/class-variance-authority@[0-9.]*/class-variance-authority/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/lucide-react@[0-9.]*/lucide-react/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/sonner@[0-9.]*/sonner/g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/next-themes@[0-9.]*/next-themes/g'
```

**Windows (PowerShell)**:
```powershell
Get-ChildItem -Path components/ui -Filter *.tsx -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '@radix-ui/([a-z-]+)@[\d.]+', '@radix-ui/$1' -replace 'class-variance-authority@[\d.]+', 'class-variance-authority' -replace 'lucide-react@[\d.]+', 'lucide-react' -replace 'sonner@[\d.]+', 'sonner' -replace 'next-themes@[\d.]+', 'next-themes' | Set-Content $_.FullName
}
```

---

### 방법 3: 수동 수정이 필요한 파일 목록

components/ui 폴더의 다음 파일들을 수정해야 합니다:

- accordion.tsx
- alert-dialog.tsx
- alert.tsx
- aspect-ratio.tsx
- avatar.tsx
- badge.tsx ✅ (완료)
- breadcrumb.tsx
- button.tsx ✅ (완료)
- calendar.tsx
- checkbox.tsx
- collapsible.tsx
- context-menu.tsx
- dialog.tsx
- drawer.tsx
- dropdown-menu.tsx
- form.tsx
- hover-card.tsx
- label.tsx
- menubar.tsx
- navigation-menu.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- scroll-area.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- sidebar.tsx
- slider.tsx
- sonner.tsx
- switch.tsx
- tabs.tsx
- toggle-group.tsx
- toggle.tsx
- tooltip.tsx

---

## ✅ 수정 완료 후

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

에러가 사라지고 정상 작동해야 합니다!
