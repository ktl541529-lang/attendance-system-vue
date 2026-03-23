# 醫院出勤申請管理系統 ── Vue 3 + Vite 前端

> 🔗 **本專案為三版本系列的一部分**
>
> | 版本 | Repo | 技術定位 |
> |------|------|----------|
> | v1 | `attendance-system` | 後端核心，Node.js + Express + PostgreSQL |
> | v2 ✦ **當前版本** | `attendance-system-vue` | 前端初版，Vue 3 + Vite |
> | v3 | `attendance-system-ts` | 前端重構版，Angular 17+ + TypeScript |

---

## 📌 Project Overview

這個版本的出發點是從 V1 純 CDN 的單頁 HTML 演進而來：**CDN 版本缺乏元件化、狀態管理分散、路由保護脆弱，隨著功能增加維護成本快速上升。**

V2 選擇以 Vue 3 + Vite 重寫，針對以下三個問題做出工程決策：

| 問題（V1 CDN 的限制） | V2 的解法 | 取捨 |
|---|---|---|
| 狀態散落在各個函式，登入資訊靠 localStorage 自行管理 | Pinia Store 集中管理 auth 狀態，並透過 `/api/auth/me` 驗證 token 有效性 | 需要額外一次 API 呼叫，但狀態可靠性大幅提升 |
| 路由保護靠 `v-show` 切換，URL 可直接存取後台頁面 | Vue Router 4 + `beforeEach` Guard，URL 層級的路由保護 | 需要設計 meta 欄位與 Guard 邏輯 |
| 每支 API 呼叫手動帶 token，401 各自處理 | 統一 `api/index.js` 模組，自動帶 token，401 集中跳轉登出 | 所有 API 呼叫須透過統一模組，不能直接用 fetch |

> 🌐 **Live Demo** → [線上展示系統](https://attendance-system-vue-seven.vercel.app)

| 項目 | 說明 |
|------|------|
| 前端 | Vercel（Vue 3 + Vite）|
| 後端 | Render（Node.js，與 v1 共用）|
| 資料庫 | Supabase（PostgreSQL，與 v1 共用）|

**示範帳號**

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | 1234 | 管理者 |
| emp1  | 1234 | 一般員工 |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Vue 3 + Vite (Vercel)                  │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Vue Router  │  │ Pinia Store │  │ api/        │ │
│  │ + Guards    │  │ auth.js     │  │ index.js    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │         │
│  ┌──────▼────────────────▼────────────────▼───────┐ │
│  │              Views / Components                │ │
│  │  LoginView  DashboardView  MyRequestsView ...  │ │
│  └───────────────────────┬────────────────────────┘ │
└───────────────────────────┼─────────────────────────┘
                            │ REST API (HTTPS)
┌───────────────────────────┼─────────────────────────┐
│      Node.js + Express Backend (Render)              │
└───────────────────────────┼─────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────┐
│             Supabase PostgreSQL                      │
└─────────────────────────────────────────────────────┘
```

**資料流設計：**

```
── 請求方向 ──────────────────────────────────────────►
User Action → Router Guard → View → api 模組 → Backend API
                  │                    │
           requiresAuth          自動帶 token
           adminOnly
                                          │
── 回應方向 ◄─────────────────────────────────────────
         View 直接渲染 ← Pinia Store ← Raw Response
```

> ⚠️ **V2 的限制：** View 直接消費 Pinia Store 的原始資料並渲染，資料轉換邏輯混在 View 內。這個問題在 V3 Angular 版本透過 ViewModel 層解決。

---

## ✨ Features

**員工功能**
- 登入 / 登出（JWT），自動帶 token、自動處理 401 登出
- 個人出勤申請統計（圖表）
- 新增 / 編輯 / 刪除出勤申請
- 查詢個人申請紀錄

**管理者功能**
- 全體出勤統計儀表板
- 審核申請（核准 / 拒絕）
- 全體申請紀錄查詢
- 員工帳號管理
- 操作審計日誌查詢

**系統特性**
- Pinia Store 集中管理登入狀態，透過 `/api/auth/me` 驗證 token 有效性
- Vue Router 4 路由保護，URL 層級攔截未授權存取
- 統一 API 模組，自動帶 token，401 集中跳轉登出
- Hash Mode 路由，相容靜態部署環境

---

## 🔍 V1 CDN vs V2 Vue 3 差異對照

| 面向 | V1 CDN 舊版作法 | V2 Vue 3 作法 |
|------|----------------|--------------|
| 狀態管理 | `token`、`currentUser` 散落各函式 | Pinia Store 集中管理，`/api/auth/me` 驗證有效性 |
| 路由保護 | `v-show` 切換，URL 可直接存取 | Vue Router 4，URL 層級的 `beforeEach` Guard |
| 權限判斷 | 無系統性設計，各頁面各自判斷 | `requiresAuth` + `adminOnly` meta 統一管理 |
| API 管理 | 每支 fetch 手動帶 token | 統一 `api/index.js`，401 集中處理 |
| 元件結構 | 單一 HTML 檔案，無元件化 | `AppSidebar`、`AppLayout`、`FormModal` 元件化 |

---

## 💡 Technical Highlights

### 1. Pinia Store ── 集中管理登入狀態

**動機：** V1 CDN 版本的 token 和 currentUser 散落在各個函式，重新整理瀏覽器後狀態是否有效無法確認，只能靠 localStorage 的值猜測。

**實作：**
```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, currentUser: null, isAdmin: false }),
  actions: {
    async fetchMe() {
      const user = await api.get('/auth/me');
      this.currentUser = user;
      this.isAdmin = user.role === 'admin';
    }
  }
});
```

**效果：** 每次頁面載入透過 `/api/auth/me` 驗證 token 是否仍有效，不依賴 localStorage 的值，登入狀態可靠。

---

### 2. Vue Router Guard ── URL 層級的路由保護

**動機：** V1 用 `v-show` 切換頁面，使用者可以透過開發者工具直接修改 DOM 看到後台內容；URL 沒有意義，無法分享或書籤特定頁面。

**實作：**
```javascript
// router/index.js
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login';
  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard';
});
```

**效果：** 未登入直接導回 login，非管理者進入 admin 頁面導回 dashboard；URL 有意義，支援書籤與分享。

---

### 3. 統一 API 模組 ── Token 注入與 401 集中處理

**動機：** V1 每支 fetch 都要手動帶 `Authorization` header，一旦忘記就會 401；token 過期後各頁面各自處理，行為不一致。

**實作：**
```javascript
// api/index.js
const api = {
  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${store.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    if (res.status === 401) {
      store.logout();
      router.push('/login');
    }
    return res.json();
  }
};
```

**效果：** 所有 API 呼叫透過統一模組，token 自動注入，401 統一登出跳轉，不需要在每個 View 重複處理。

---

### 4. 元件化架構

**動機：** V1 所有邏輯在單一 HTML 檔案，新增功能需要在一個越來越大的檔案裡找位置，維護成本高。

**實作：**
```
AppLayout（登入後外框）
  ├── AppSidebar（導覽選單，依角色顯示不同項目）
  ├── <slot>（各 View 的內容區塊）
  └── FormModal（新增 / 編輯申請 Modal）
```

**效果：** 共用 UI 邏輯集中在元件，各 View 只負責自己的業務邏輯；新增頁面只需新增 View，不需動共用結構。

---

## 🗂️ Tech Stack

| 項目 | 技術 |
|------|------|
| 前端框架 | Vue 3 Composition API，Vite |
| 狀態管理 | Pinia |
| 路由 | Vue Router 4（Hash Mode）|
| HTTP 管理 | 統一 Fetch API 模組，401 自動登出 |
| 樣式 | 原生 CSS |
| 部署 | Vercel |

---

## 📁 Project Structure

```
src/
├── api/
│   └── index.js              # 統一 API 模組，自動帶 token，401 跳轉登出
├── stores/
│   └── auth.js               # Pinia store，login / logout / fetchMe
├── router/
│   └── index.js              # Vue Router，requiresAuth + adminOnly Guard
├── components/
│   ├── AppSidebar.vue        # 側邊導覽，依角色顯示選單
│   ├── AppLayout.vue         # 登入後版面框架
│   └── FormModal.vue         # 新增 / 編輯申請 Modal
└── views/
    ├── LoginView.vue
    ├── DashboardView.vue
    ├── MyRequestsView.vue
    ├── ReviewView.vue         # 管理者審核頁面
    ├── AllRecordsView.vue     # 管理者全體紀錄
    ├── UsersView.vue          # 員工帳號管理
    └── LogsView.vue           # 操作審計日誌
```

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

後端 API（[attendance-system](https://github.com/ktl541529-lang/attendance-system)）部署於 Render。

API Base URL 設定於 `src/api/index.js`：

```javascript
const API_BASE = 'https://attendance-system-p71q.onrender.com/api';
```

---

## 🔮 Future Improvements

以下為評估後的規劃方向：

- [ ] **單元測試 Vitest** ── 補充 Pinia store 與 API 模組的單元測試；目前功能仍在迭代，測試優先補在穩定後的核心邏輯
- [ ] **多租戶架構** ── 需後端同步改造，規劃說明參見 [attendance-system 後端](https://github.com/ktl541529-lang/attendance-system)

> ✅ **TypeScript 遷移**：已於 V3 Angular 版本實現，包含 interface 型別定義、union type、HttpInterceptor 等完整型別安全設計，參見 [attendance-system-ts](https://github.com/ktl541529-lang/attendance-system-ts)。

---

> 📎 **演進說明**：V2 的資料轉換邏輯仍混在 View 內，隨著頁面複雜度提升這成為維護瓶頸。V3 Angular 版本透過 ViewModel 層解決這個問題，實現 UI 與後端資料結構的完整解耦。
