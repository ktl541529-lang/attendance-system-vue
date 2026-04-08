// src/utils/format.js

export function fmtDate(d) {
  return d
    ? new Date(d).toLocaleString('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(/\//g, '-')
    : '-'
}

export function fmtDay(d) {
  return d ? d.split('T')[0] : '-'
}

export function statusBadge(s) {
  return {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }[s] || ''
}

export function statusLabel(s) {
  return { pending: '待審核', approved: '已核准', rejected: '已拒絕' }[s] || s
}

export function actionLabel(action) {
  const map = {
    LOGIN: '登入', LOGOUT: '登出',
    CLOCK_IN: '上班打卡', CLOCK_OUT: '下班打卡',
    CREATE_REQUEST: '新增申請', UPDATE_REQUEST: '修改申請',
    DELETE_REQUEST: '刪除申請', APPROVE_REQUEST: '核准申請',
    REJECT_REQUEST: '拒絕申請', CREATE_USER: '新增使用者',
    UPDATE_USER: '修改使用者', DELETE_USER: '刪除使用者',
    LEAVE_APPLY: '請假申請',
  }
  return map[action?.toUpperCase()] || action
}

export function actionBadgeClass(action) {
  const a = action?.toUpperCase() || ''
  if (a.includes('APPROVE')) return 'badge-approved'
  if (a.includes('REJECT') || a.includes('DELETE')) return 'badge-rejected'
  if (a.includes('CREATE') || a.includes('CLOCK') || a.includes('LOGIN')) return 'badge-pending'
  return ''
}