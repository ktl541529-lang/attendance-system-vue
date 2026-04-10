# 醫院出勤申請管理系統 ── Vue 3 前端

> 🔗 **本專案為三版本系列的一部分**
>
> | 版本 | Repo | 技術定位 |
> |------|------|----------|
> | v1 | `attendance-system` | 後端核心，Node.js + Express + PostgreSQL |
> | v2 | `attendance-system-ts` | Angular 前端，TypeScript 技術探索 |
> | v3 ✦ **當前版本** | `attendance-system-vue` | Vue 3 前端，主力版本，持續迭代中 |

---

## 📌 Project Overview

這個專案的出發點是從 V1 純 CDN 的單頁 HTML 演進而來：**CDN 版本缺乏元件化、狀態管理分散、路由保護脆弱，隨著功能增加維護成本快速上升。**

V3 選擇以 Vue 3 + Vite 重寫，並持續透過工程化重構提升可維護性：

| 問題（V1 CDN 的限制） | V3 的解法 | 取捨 |
|---|---|---|
| 狀態散落在各個函式，登入資訊靠 localStorage 自行管理 | Pinia Store 集中管理 auth 狀態，透過 `/api/auth/me` 驗證 token 有效性 | 需要額外一次 API 呼叫，但狀態可靠性大幅提升 |
| 路由保護靠 `v-show` 切換，URL 可直接存取後台頁面 | Vue Router 4 + `beforeEach` Guard，URL 層級的路由保護 | 需要設計 meta 欄位與 Guard 邏輯 |
| 每支 API 呼叫手動帶 token，401 各自處理 | Axios instance 統一管理，自動帶 token，401 集中跳轉登出 | 所有 API 呼叫須透過統一模組 |
| API 端點散落各處，View 直接呼叫 axios | API 層按功能域拆分，View 只負責顯示邏輯 | 新增 API 需找對應模組，但職責清楚 |
| 資料狀態各 View 自己管理，跨頁面不同步 | Pinia Store 集中管理業務資料，UI 狀態留在 View | 需區分哪些狀態該放 Store |

> 🌐 **Live Demo** → [線上展示系統](https://attendance-system-vue-seven.vercel.app)

| 項目 | 說明 |
|------|------|
| 前端 | Vercel（Vue 3 + Vite）|
| 後端 | Render（Node.js + Express）|
| 資料庫 | Supabase（PostgreSQL）|

**示範帳號**

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | 1234 | 管理者 |
| emp1  | 1234 | 一般員工 |

> ⚠️ 後端部署於 Render 免費方案，閒置後會休眠。首次存取請稍候 30-60 秒待服務喚醒。

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Vue 3 + Vite (Vercel)                  │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Vue Router  │  │ Pinia Store │  │ api/        │ │
│  │ + Guards    │  │ auth.js     │  │ client.js   │ │
│  │             │  │ attendance  │  │ auth.js     │ │
│  │ requiresAuth│  │ users.js    │  │ attendance  │ │
│  │ adminOnly   │  │             │  │ logs.js ... │ │
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
User Action → Router Guard → View → Pinia Action → api 模組 → Backend API
                  │                                    │
           requiresAuth                         自動帶 token
           adminOnly                            401 集中處理

── 回應方向 ◄─────────────────────────────────────────
         View 渲染 ← Pinia Store ← api 模組 ← Raw Response
```

---

## ✨ Features

**員工功能**
- 登入 / 登出（JWT），自動帶 token、自動處理 401 登出
- 新增 / 編輯 / 刪除出勤申請
- 查詢個人申請紀錄
- 查詢個人操作紀錄（My Logs）

**管理者功能**
- 全體出勤統計儀表板
- 審核申請（核准 / 拒絕）
- 全體申請紀錄查詢
- 員工帳號管理
- 全體操作審計日誌查詢

**系統特性**
- Pinia Store 集中管理登入狀態，透過 `/api/auth/me` 驗證 token 有效性
- Vue Router 4 路由保護，URL 層級攔截未授權存取
- Axios instance 統一管理，自動帶 token，401 集中跳轉登出
- API 層按功能域拆分（auth / attendance / users / logs）
- Hash Mode 路由，相容靜態部署環境
- fetchMe() 在 router 掛載前完成，確保 guard 執行時使用者資料已就緒

---

## 💡 Technical Highlights

### 1. 初始化時序設計 ── fetchMe() 在 main.js 完成

**動機：** router guard 執行早於 `App.vue` 的 `onMounted`，若 `fetchMe()` 放在 `onMounted`，admin 重整 adminOnly 頁面時 `isAdmin` 尚未就緒，會被錯誤踢到 dashboard。

**實作：**
```javascript
// main.js
const pinia = createPinia()
app.use(pinia)

const { useAuthStore } = await import('./stores/auth.js')
const auth = useAuthStore()

if (auth.token) await auth.fetchMe()
else auth.isInitialized = true

app.use(router) // fetchMe 完成後才掛載 router
app.mount('#app')
```

**效果：** guard 執行時 `currentUser` 已就緒，重整頁面不會錯誤跳轉。

---

### 2. Pinia Store ── 集中管理狀態，區分業務資料與 UI 狀態

**動機：** 各 View 自己管理的資料狀態導致跨頁面不同步，且 View 程式碼混雜了資料邏輯與顯示邏輯。

**實作原則：**

| 放 Store | 留在 View |
|----------|-----------|
| 出勤紀錄、使用者列表 | `showModal`、`editingRecord` |
| filter、pagination | 表單暫存資料 |
| API 呼叫 action | toast、UI 互動狀態 |

```javascript
// stores/attendance.js
export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref([])
  const loading = ref(false)
  const filter = ref({ status: '', type: '' })

  async function fetchRecords(params) {
    loading.value = true
    try {
      const data = await getAttendanceApi(params)
      if (data.success) records.value = data.data
    } finally {
      loading.value = false
    }
  }

  return { records, loading, filter, fetchRecords }
})
```

**效果：** 資料來源單一，多個 View 讀取同一份資料不會不同步；View 程式碼只負責顯示邏輯。

---

### 3. API 分層 ── 按功能域拆分，View 不直接碰 axios

**動機：** 原本 axios instance 和 API function 混在一起，端點字串散落各 View，相同的格式化函式重複出現。

**實作：**
```
api/
├── client.js      ← axios instance + interceptors（自動帶 token、401 處理）
├── auth.js        ← 認證相關 API
├── attendance.js  ← 出勤相關 API
├── users.js       ← 使用者相關 API
├── logs.js        ← 日誌相關 API
└── index.js       ← re-export 入口（向下相容）
```

**效果：** 新增 API 只需改對應檔案，View 完全不知道 axios 的存在。

---

### 4. Vue Router Guard ── URL 層級的路由保護

**動機：** V1 用 `v-show` 切換頁面，使用者可以透過開發者工具直接修改 DOM 看到後台內容。

**實作：**
```javascript
// router/index.js
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard'
})
```

**效果：** 未登入直接導回 login，非管理者進入 admin 頁面導回 dashboard；guard 為純同步，不依賴非同步操作。

---

### 5. 共用工具層 ── utils/format.js

**動機：** 相同的格式化函式（日期、狀態 badge、操作 label）在四個 View 重複定義，重構過渡期出現識別子衝突錯誤。

**實作：**
```javascript
// utils/format.js
export function fmtDate(d) { ... }      // 格式化完整日期時間
export function fmtDay(d) { ... }       // 只取日期部分
export function statusBadge(s) { ... }  // 狀態對應 CSS class
export function statusLabel(s) { ... }  // 狀態對應中文文字
export function actionLabel(action) { ... }      // 操作代碼對應中文
export function actionBadgeClass(action) { ... } // 操作對應 CSS class
```

**效果：** 相同邏輯只寫一次，格式變更只需改一個地方。

---

## 🗂️ Tech Stack

| 項目 | 技術 |
|------|------|
| 前端框架 | Vue 3 Composition API，Vite |
| 狀態管理 | Pinia |
| 路由 | Vue Router 4（Hash Mode）|
| HTTP 管理 | Axios，統一 instance + interceptors |
| 樣式 | 原生 CSS |
| 部署 | Vercel |

---

## 📁 Project Structure

```
src/
├── api/
│   ├── client.js        # axios instance + interceptors
│   ├── auth.js          # 認證相關 API
│   ├── attendance.js    # 出勤相關 API
│   ├── users.js         # 使用者相關 API
│   ├── logs.js          # 日誌相關 API
│   └── index.js         # re-export 入口
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue    # 登入後版面框架
│   │   └── AppSidebar.vue   # 側邊導覽，依角色顯示選單
│   └── ui/
│       └── FormModal.vue    # 新增 / 編輯申請 Modal
├── constants/
│   └── routes.js        # NAV_ROUTES + PAGE_META 設定
├── composables/         # 共用邏輯（規劃中）
├── router/
│   └── index.js         # Vue Router，requiresAuth + adminOnly Guard
├── stores/
│   ├── auth.js          # 登入狀態，login / logout / fetchMe
│   ├── attendance.js    # 出勤紀錄狀態與 action
│   └── users.js         # 使用者列表狀態與 action
├── utils/
│   └── format.js        # 日期、狀態、操作的格式化函式
└── views/
    ├── LoginView.vue
    ├── DashboardView.vue
    ├── MyRequestsView.vue
    ├── MyLogsView.vue       # 一般員工查看個人操作紀錄
    ├── ReviewView.vue       # 管理者審核頁面
    ├── AllRecordsView.vue   # 管理者全體紀錄
    ├── UsersView.vue        # 員工帳號管理
    └── LogsView.vue         # 全體操作審計日誌
```

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

後端 API 部署於 Render，API Base URL 設定於 `src/api/client.js`：

```javascript
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://attendance-system-p71q.onrender.com/api'
```

本地開發如需指向本地後端，在 `.env.local` 加入：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🔮 Future Improvements（Phase 5 規劃）

- [ ] **Toast 通知系統** ── 建立全域 composable，統一操作成功 / 失敗的回饋
- [ ] **全域錯誤處理** ── API 失敗提供使用者看得到的 UI 回饋
- [ ] **表單驗證** ── 統一登入和申請表單的驗證邏輯
- [ ] **Dashboard 資料化** ── 串接真實數據，顯示本月申請數、待審核數、最近紀錄
- [ ] **Empty state 統一** ── 抽成共用元件，統一各頁面空狀態的樣式和文案
- [ ] **composables 抽離** ── 將分頁邏輯抽成 `usePagination` composable
- [ ] **搜尋 & 篩選** ── AllRecordsView 和 LogsView 加上日期範圍、關鍵字篩選

---

> 📎 **版本說明**：v2 Angular 版本（[attendance-system-ts](https://github.com/ktl541529-lang/attendance-system-ts)）為 TypeScript 與 Angular 生態的技術探索，主力開發集中於本專案。
