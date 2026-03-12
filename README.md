# 醫院出勤申請管理系統 — Vue 3 + Vite 重構版

本專案為 **attendance-system** 的 Vue 3 Vite 重構版本  
將原本以單一 HTML + CDN 實作的前端，重構為 Vite + SFC 元件化架構，後端 API 不變

🌐 **線上 Demo**  
👉 [點此開啟系統](https://ktl541529-lang.github.io/attendance-system-vue/)

| 層級 | 服務 |
|------|------|
| 前端 | GitHub Pages（Vue 3 + Vite） |
| 後端 | Render（Node.js）— 與原版共用 |
| 資料庫 | Railway（MySQL）— 與原版共用 |

**示範帳號**

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | 1234 | 管理者 |
| emp1 | 1234 | 一般員工 |

---

## 🛠 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Vue 3 Composition API、Vite |
| 樣式 | 原生 CSS（從 CDN 版搬移重構） |
| 狀態管理 | Pinia |
| 路由 | Vue Router 4（Hash Mode） |
| HTTP 管理 | Fetch API 統一模組 |
| 部署 | GitHub Pages + gh-pages |
| 版本控管 | Git / GitHub |

---

## 🔑 技術亮點

### 1. Pinia 集中狀態管理
使用者登入狀態（token、currentUser、isAdmin）統一由 Pinia store 管理，頁面重整後自動呼叫 `/api/auth/me` 還原登入狀態，避免 CDN 版本中狀態散落各處的問題。

### 2. Vue Router 路由守衛
`beforeEach` 搭配 `requiresAuth` 與 `adminOnly` meta 欄位控管頁面存取權限，未登入自動導回登入頁，一般員工無法進入管理者專屬頁面。
```javascript
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login';
  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard';
});
```

### 3. 統一 API 模組
所有 HTTP 請求集中在 `src/api/index.js`，自動附加 `Authorization: Bearer <token>`，攔截 401 回應後清除 token 並導回登入頁，對應後端 `auth.js` middleware 形成前後端對稱的安全防護。

### 4. 元件化架構
將 CDN 版的單一 HTML 拆分為可複用元件：`AppSidebar`、`AppLayout`、`FormModal`，各 View 透過 `<slot>` 組合，減少重複程式碼。

### 5. Hash Mode 相容靜態部署
使用 `createWebHashHistory` 讓 Vue Router 相容 GitHub Pages 靜態伺服器，無需後端 rewrite 設定。

---

## 📁 專案結構
```
src/
├── api/
│   └── index.js              # 統一 API 呼叫，含 401 自動登出
├── stores/
│   └── auth.js               # Pinia store（login / logout / fetchMe）
├── router/
│   └── index.js              # Vue Router，含路由守衛
├── components/
│   ├── AppSidebar.vue        # 側邊欄（含角色權限控制）
│   ├── AppLayout.vue         # 登入後共用外框
│   └── FormModal.vue         # 新增 / 編輯申請 Modal
├── views/
│   ├── LoginView.vue         # 登入頁
│   ├── DashboardView.vue     # 總覽儀表板
│   ├── MyRequestsView.vue    # 我的申請
│   ├── ReviewView.vue        # 審核管理（管理者）
│   ├── AllRecordsView.vue    # 全部記錄（管理者）
│   ├── UsersView.vue         # 員工帳號管理（管理者）
│   └── LogsView.vue          # 操作紀錄（管理者）
├── App.vue                   # 根元件，自動還原登入狀態
├── main.js                   # 註冊 Pinia + Router
└── style.css                 # 全域樣式
```

---

## 🔄 與原版的差異

| 面向 | 原版（Vue 3 CDN） | 本版（Vue 3 Vite） |
|------|-------------------|--------------------|
| 架構 | 單一 HTML 檔 | Vite + SFC 元件化 |
| 狀態管理 | 全域變數 | Pinia Store |
| 路由 | 手動 v-show 切換 | Vue Router 4 |
| API 管理 | 分散在各函式 | 統一 api 模組 |
| 路由保護 | 無 | beforeEach 守衛 |
| 部署 | GitHub Pages | GitHub Pages |

---

## ⚙️ 本機開發
```bash
npm install
npm run dev
```

後端 API：[attendance-system](https://github.com/ktl541529-lang/attendance-system)（部署於 Render）