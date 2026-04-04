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
    login: '登入', logout: '登出',
    create_request: '新增申請', update_request: '修改申請',
    delete_request: '刪除申請', approve_request: '核准申請',
    reject_request: '拒絕申請', create_user: '新增使用者',
    update_user: '修改使用者', delete_user: '刪除使用者',
  }
  return map[action] || action
}

export function actionBadgeClass(action) {
  if (action.includes('approve')) return 'badge-approved'
  if (action.includes('reject') || action.includes('delete')) return 'badge-rejected'
  if (action.includes('create')) return 'badge-pending'
  return ''
}