<script setup>
import { ref, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { fmtDate, fmtDay, statusBadge, statusLabel } from '@/utils/format.js'

const attendance = useAttendanceStore()

const toasts = ref([])
let toastCounter = 0

const leaveTypes = ['事假', '病假', '年假', '喪假', '公傷假', '生理假', '其他']

let searchTimer = null

function toast(type, msg) {
  const id = ++toastCounter
  toasts.value.push({ id, type, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

async function fetchRecords(page = 1) {
  const params = { page, limit: attendance.pagination.limit }
  if (attendance.filter.keyword) params.keyword = attendance.filter.keyword
  if (attendance.filter.status) params.status = attendance.filter.status
  if (attendance.filter.type) params.type = attendance.filter.type
  if (attendance.filter.date_from) params.date_from = attendance.filter.date_from
  if (attendance.filter.date_to) params.date_to = attendance.filter.date_to
  await attendance.fetchRecords(params)
}

function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchRecords(1), 400)
}

function resetFilter() {
  attendance.resetFilter()
  fetchRecords(1)
}

function exportCSV() {
  if (!attendance.records.length) { toast('warning', '目前沒有資料可匯出'); return }
  const header = ['編號', '申請人', '部門', '類型', '開始日期', '結束日期', '原因', '狀態', '拒絕原因', '建立時間']
  const rows = attendance.records.map(r => [
    r.id, r.user_name, r.dept, r.type,
    fmtDay(r.start_date), fmtDay(r.end_date),
    `"${r.reason}"`, statusLabel(r.status),
    r.reject_reason || '', fmtDate(r.created_at),
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `出勤紀錄_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast('success', 'CSV 匯出成功')
}

onMounted(async () => {
  await fetchRecords()
})
</script>

<template>
  <AppLayout>
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">
        <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : '!' }}</span>{{ t.msg }}
      </div>
    </div>

    <div class="page-header">
      <div>
        <div class="page-title">全部記錄</div>
        <div class="page-desc">共 {{ attendance.pagination.total }} 筆記錄</div>
      </div>
      <button class="btn btn-outline" @click="exportCSV">⬇ 匯出 CSV</button>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input class="form-control" v-model="attendance.filter.keyword"
          placeholder="🔍 搜尋員工、事由..." @input="debounceSearch" />
        <select class="form-control" v-model="attendance.filter.status" @change="fetchRecords(1)">
          <option value="">全部狀態</option>
          <option value="pending">申請中</option>
          <option value="approved">已核准</option>
          <option value="rejected">已退回</option>
        </select>
        <select class="form-control" v-model="attendance.filter.type" @change="fetchRecords(1)">
          <option value="">全部類型</option>
          <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <input type="date" class="form-control" v-model="attendance.filter.date_from" @change="fetchRecords(1)" />
        <input type="date" class="form-control" v-model="attendance.filter.date_to" @change="fetchRecords(1)" />
        <button class="btn btn-outline btn-sm" @click="resetFilter">重置</button>
      </div>

      <div v-if="attendance.loading" style="text-align:center;padding:40px">
        <span class="loading-spinner" style="width:24px;height:24px"></span>
      </div>

      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr>
              <th>編號</th>
              <th>申請人</th>
              <th>部門</th>
              <th>類型</th>
              <th>開始</th>
              <th>結束</th>
              <th>事由</th>
              <th>狀態</th>
              <th>退回原因</th>
              <th>申請時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="attendance.records.length === 0">
              <td colspan="10">
                <div class="empty-state"><p>查無符合條件的記錄</p></div>
              </td>
            </tr>
            <tr v-for="r in attendance.records" :key="r.id">
              <td class="text-mono text-sm">#{{ r.id }}</td>
              <td><strong>{{ r.user_name }}</strong></td>
              <td class="text-sm">{{ r.dept }}</td>
              <td><span class="chip">{{ r.type }}</span></td>
              <td class="text-mono text-sm">{{ fmtDay(r.start_date) }}</td>
              <td class="text-mono text-sm">{{ fmtDay(r.end_date) }}</td>
              <td>{{ r.reason }}</td>
              <td><span class="badge" :class="statusBadge(r.status)">{{ statusLabel(r.status) }}</span></td>
              <td style="font-size:12px;color:var(--danger)">{{ r.reject_reason || '—' }}</td>
              <td class="text-sm">{{ fmtDate(r.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="attendance.pagination" v-if="attendance.pagination.totalPages > 1">
        <button class="btn btn-outline btn-sm"
          :disabled="attendance.pagination.page <= 1"
          @click="fetchRecords(attendance.pagination.page - 1)">← 上一頁</button>
        <span style="font-size:13px;color:var(--text-2)">
          第 {{ attendance.pagination.page }} / {{ attendance.pagination.totalPages }} 頁
        </span>
        <button class="btn btn-outline btn-sm"
          :disabled="attendance.pagination.page >= attendance.pagination.totalPages"
          @click="fetchRecords(attendance.pagination.page + 1)">下一頁 →</button>
      </div>
    </div>
  </AppLayout>
</template>
