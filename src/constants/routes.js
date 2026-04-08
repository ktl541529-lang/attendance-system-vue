// src/constants/routes.js
export const NAV_ROUTES = [
  {
    section: '總覽',
    items: [
      {
        path: '/dashboard',
        label: '儀表板',
        adminOnly: false,
        icon: `<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>`,
      },
    ],
  },
  {
    section: '申請管理',
    items: [
      {
        path: '/my-requests',
        label: '我的申請',
        adminOnly: false,
        icon: `<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>`,
      },
      {
        path: '/review',
        label: '審核申請',
        adminOnly: true,
        icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
      },
      {
        path: '/all-records',
        label: '所有紀錄',
        adminOnly: true,
        icon: `<path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zm-4-4h2v-2H3v2zm10-16H7v2h6V1zm6 0v2h2c0-1.1-.9-2-2-2zM3 21c0 1.1.9 2 2 2v-2H3zm16 2c1.1 0 2-.9 2-2h-2v2zM3 9h2V7H3v2zm10 12h-2v2h2v-2zm6-12h2V7h-2v2zm0 12v-2h-2c0 1.1.9 2 2 2z"/>`,
      },
    ],
  },  
  {
    section: '系統管理',
    items: [
      {
        path: '/users',
        label: '使用者管理',
        adminOnly: true,
        icon: `...`,
      },
      {
        path: '/logs',
        label: '操作紀錄',
        adminOnly: true, 
        icon: `...`,
      },
      {
        path: '/my-logs',
        label: '我的紀錄',
        adminOnly: false, 
        icon: `<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>`,
      },
    ],
  },
];

export const PAGE_META = {
  '/dashboard': {
    title: '儀表板',
    sub: (user) => `歡迎回來，${user?.name || ''}`,
  },
  '/my-requests': { title: '我的申請', sub: () => '查看與管理你的申請紀錄' },
  '/review': { title: '審核申請', sub: () => '審核員工的請假申請' },
  '/all-records': { title: '所有紀錄', sub: () => '查看所有員工的出勤紀錄' },
  '/users': { title: '使用者管理', sub: () => '管理系統使用者帳號' },
  '/logs': { title: '操作紀錄', sub: () => '查看系統操作日誌' },
  '/my-logs': { title: '我的紀錄', sub: () => '查看你的操作紀錄' },
};
