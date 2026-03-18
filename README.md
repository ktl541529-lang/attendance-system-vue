# 醫院出勤申請管理系統 — Vue 3 + Vite 重構版

> 🔁 **系列說明｜三版本技術演進**
>
> | 版本 | Repo | 核心目標 |
> |------|------|----------|
> | v1 | `attendance-system` | 後端架構設計、業務邏輯實作 |
> | v2 ｜**你在這裡** | `attendance-system-vue` | 前端元件化工程實踐（Vue 3 + Vite） |
> | v3 | `attendance-system-ts` | 企業級前端重構（Angular 17+ + TypeScript） |

---

## 📌 Project Overview

這是一套醫院員工出勤申請管理的全端網頁系統，前端以 Vue 3 + Vite 實作，串接共用的 Node.js / PostgreSQL 後端。
本版本針對 v1 CDN 原型的工程瓶頸進行重構：登入狀態散落為全域變數的問題以 Pinia 集中管理解決、缺乏 URL 路由的問題以 Vue Router 4 搭配導航守衛解決、API 呼叫分散各處的問題以統一模組加 401 自動登出機制解決。

🌐 **線上 Demo** → [點此開啟系統](https://attendance-system-vue-seven.vercel.app)

| 層級 | 服務 |
|------|------|
| 前端 | Vercel（Vue 3 + Vite） |
| 後端 | Render（Node.js）— 與 v1 共用 |
| 資料庫 | Supabase（PostgreSQL）— 與 v1 共用 |

**示範帳號**

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | 1234 | 管理者 |
| emp1  | 1234 | 一般員工 |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Vue 3 + Vite (Vercel)              │
│                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Vue Router │  │ Pinia Store  │  │  api/       │  │
│  │ + Guards   │  │ auth.js      │  │  index.js   │  │
│  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘  │
│        │                │                  │         │
│  ┌─────▼────────────────▼──────────────────▼──────┐  │
│  │                   Views / Components            │  │
│  │  LoginView  DashboardView  MyRequestsView  ...  │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────┘
                            │ REST API (HTTPS)
┌───────────────────────────▼─────────────────────────┐
│          Node.js + Express Backend (Render)          │
└───────────────────────────┬─────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────┐
│              Supabase PostgreSQL                     │
└──────────────────────────────────────────────────────┘
```

**前端資料流：**

```
URL 變更 → Router Guard（驗證登入 / 角色）→ View 載入 → API 呼叫 → Pinia Store 更新 → UI 重繪
```

---

## ✨ Features

**員工功能**
- 登入 / 登出（JWT，頁面重整後自動還原登入狀態）
- 個人申請列表（含狀態篩選）
- 新增 / 編輯 / 刪除出勤申請
- 查看審核結果與退回原因

**管理者功能**
- 角色分離儀表板（全員統計、假別分佈、申請趨勢圖）
- 審核管理（核准 / 退回，需填退回原因）
- 全部申請紀錄查詢
- 員工帳號管理
- 操作稽核紀錄查詢

**系統特性**
- 路由守衛——未登入自動導回登入頁，員工無法存取管理頁面
- 401 自動登出——Token 過期即清除並導回登入頁
- Hash Mode 路由——相容靜態部署，無需後端 rewrite

---

## 🎯 重構動機：CDN 版本的工程限制

| 問題 | CDN 版本的狀況 | 重構後的解法 |
|------|--------------|------------|
| 狀態管理 | `token`、`currentUser` 散落為全域變數 | Pinia Store 統一管理，頁面重整後自動還原 |
| 路由控制 | `v-show` 手動切換頁面，無 URL 對應 | Vue Router 4，支援 URL 導航與路由守衛 |
| 權限保護 | 靠前端隱藏元素，無系統性攔截 | `beforeEach` 搭配 `requiresAuth`、`adminOnly` meta |
| API 管理 | 各函式各自帶 token，邏輯分散 | 統一 `api/index.js` 模組，401 自動登出 |
| 重複程式碼 | sidebar、modal 在各區塊重複定義 | `AppSidebar`、`AppLayout`、`FormModal` 元件化 |

---

## 🔑 Technical Highlights

### 1. Pinia 集中狀態管理

登入狀態（`token`、`currentUser`、`isAdmin`）統一由 Pinia store 管理。頁面重整後自動呼叫 `/api/auth/me` 還原登入狀態，解決 CDN 版重整即登出的問題。

### 2. Vue Router 路由守衛

```javascript
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login';
  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard';
});
```

`requiresAuth` 與 `adminOnly` 以 meta 欄位宣告在路由設定裡，守衛邏輯集中在一處，新增頁面時不需要重複撰寫權限判斷。

### 3. 統一 API 模組

所有 HTTP 請求集中在 `src/api/index.js`，自動附加 `Authorization: Bearer <token>`，攔截 401 回應後清除 token 並導回登入頁。

這與後端 `auth.js` middleware 形成**前後端對稱的安全防護**：後端拒絕非法 token，前端即時感知並登出。

### 4. 元件化架構

將 CDN 版的單一 HTML 拆分為可複用元件，透過 `<slot>` 組合各 View：

```
AppLayout（外框）
  └─ AppSidebar（導覽，含角色權限控制）
  └─ <slot>（各 View 內容）
       └─ FormModal（新增 / 編輯申請 Modal）
```

---

## 🔄 與 v1 CDN 版的完整對比

| 面向 | v1（Vue 3 CDN） | v2（Vue 3 Vite） |
|------|----------------|-----------------|
| 架構 | 單一 HTML 檔 | Vite + SFC 元件化 |
| 狀態管理 | 全域變數，重整即失效 | Pinia Store + `/api/auth/me` 自動還原 |
| 路由 | `v-show` 手動切換 | Vue Router 4 + URL 對應 |
| 權限保護 | 元素隱藏，無系統性攔截 | `beforeEach` 路由守衛 |
| API 管理 | 分散在各函式 | 統一 `api` 模組，含 401 自動登出 |
| 元件重用 | 無 | `AppSidebar`、`AppLayout`、`FormModal` |

---

## 🛠 Tech Stack

| 層級 | 技術 |
|------|------|
| 前端框架 | Vue 3 Composition API、Vite |
| 狀態管理 | Pinia |
| 路由 | Vue Router 4（Hash Mode） |
| HTTP 管理 | Fetch API 統一模組（含 401 攔截） |
| 樣式 | 原生 CSS |
| 部署 | Vercel |

---

## 📁 Project Structure

```
src/
├── api/
│   └── index.js              # 統一 API 呼叫，自動帶 token，含 401 自動登出
├── stores/
│   └── auth.js               # Pinia store（login / logout / fetchMe）
├── router/
│   └── index.js              # Vue Router，含 requiresAuth + adminOnly 守衛
├── components/
│   ├── AppSidebar.vue        # 側邊欄（含角色權限控制）
│   ├── AppLayout.vue         # 登入後共用外框
│   └── FormModal.vue         # 新增 / 編輯申請 Modal
├── views/
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── MyRequestsView.vue
│   ├── ReviewView.vue        # 管理者審核
│   ├── AllRecordsView.vue    # 管理者查看全部
│   ├── UsersView.vue         # 員工帳號管理
│   └── LogsView.vue          # 操作紀錄
├── App.vue                   # 根元件，自動還原登入狀態
└── main.js
```

---

## ⚙️ Local Development

```bash
npm install
npm run dev
```

後端 API：[attendance-system](https://github.com/ktl541529-lang/attendance-system)（部署於 Render）

API Base URL 設定於 `src/api/index.js`：

```javascript
const API_BASE = 'https://attendance-system-p71q.onrender.com/api';
```

---

## 🔮 Future Improvements

- [ ] 多租戶架構——讓不同診所 / 機構各自使用獨立資料空間
- [ ] Stripe 訂閱金流——轉型為按月計費的 SaaS 產品
- [ ] TypeScript 遷移——為 Vue 3 版加入型別安全（參考 v3 Angular 版的實作）
- [ ] 單元測試——使用 Vitest 為 Pinia store 和 API 模組補充測試覆蓋
- [ ] PWA 支援——加入 Service Worker，支援離線瀏覽申請紀錄
- [ ] i18n 多語系——支援繁中 / 英文介面切換
- [ ] 深色模式——CSS 變數架構已具備切換條件

---

> ➡️ **下一步**：Vue 3 版建立了元件化基礎，但缺乏型別系統與更嚴謹的資料流管理。
> 前往 [`attendance-system-ts`](https://github.com/ktl541529-lang/attendance-system-ts) 查看 Angular 重構如何解決這些問題。
