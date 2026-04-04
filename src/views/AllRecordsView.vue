<script setup>
import { ref, onMounted } from 'vue'
import { getAttendanceApi } from '@/api/attendance.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { fmtDate, fmtDay, statusBadge, statusLabel } from '@/utils/format.js'

const records = ref([])
const pageLoading = ref(false)
const toasts = ref([])
let toastCounter = 0

const filter = ref({ keyword: '', status: '', type: '', date_from: '', date_to: '' })
const leaveTypes = ['事假', '病假', '年假', '喪假', '公傷假', '生理假', '其他']
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })

function toast(type, msg) {
  const id = ++toastCounter
  toasts.value.push({ id, type, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

async function fetchRecords(page = 1) {
  const params = { page, limit: pagination.value.limit }
  if (filter.value.keyword) params.keyword = filter.value.keyword
  if (filter.value.status) params.status = filter.value.status
  if (filter.value.type) params.type = filter.value.type
  if (filter.value.date_from) params.date_from = filter.value.date_from
  if (filter.value.date_to) params.date_to = filter.value.date_to

  const data = await getAttendanceApi(params)
  if (data.success) {
    records.value = data.data
    pagination.value = { ...pagination.value, ...data.pagination, page }
  }
}

let searchTimer = null
function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchRecords(1), 400)
}

function resetFilter() {
  filter.value = { keyword: '', status: '', type: '', date_from: '', date_to: '' }
  fetchRecords(1)
}

function exportCSV() {
  if (!records.value.length) { toast('warning', '目前沒有資料可匯出'); return }
  const header = ['編號', '申請人', '部門', '類型', '開始日期', '結束日期', '原因', '狀態', '拒絕原因', '建立時間']
  const rows = records.value.map(r => [
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
  pageLoading.value = true
  await fetchRecords()
  pageLoading.value = false
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
        <div class="page-desc">共 {{ pagination.total }} 筆記錄</div>
      </div>
      <button class="btn btn-outline" @click="exportCSV">⬇ 匯出 CSV</button>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input class="form-control" v-model="filter.keyword"
          placeholder="🔍 搜尋員工、事由..." @input="debounceSearch" />
        <select class="form-control" v-model="filter.status" @change="fetchRecords(1)">
          <option value="">全部狀態</option>
          <option value="pending">申請中</option>
          <option value="approved">已核准</option>
          <option value="rejected">已退回</option>
        </select>
        <select class="form-control" v-model="filter.type" @change="fetchRecords(1)">
          <option value="">全部類型</option>
          <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <input type="date" class="form-control" v-model="filter.date_from" @change="fetchRecords(1)" />
        <input type="date" class="form-control" v-model="filter.date_to" @change="fetchRecords(1)" />
        <button class="btn btn-outline btn-sm" @click="resetFilter">重置</button>
      </div>

      <div v-if="pageLoading" style="text-align:center;padding:40px">
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
            <tr v-if="records.length === 0">
              <td colspan="10">
                <div class="empty-state"><p>查無符合條件的記錄</p></div>
              </td>
            </tr>
            <tr v-for="r in records" :key="r.id">
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
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="btn btn-outline btn-sm"
          :disabled="pagination.page <= 1"
          @click="fetchRecords(pagination.page - 1)">← 上一頁</button>
        <span style="font-size:13px;color:var(--text-2)">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 頁
        </span>
        <button class="btn btn-outline btn-sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="fetchRecords(pagination.page + 1)">下一頁 →</button>
      </div>
    </div>
  </AppLayout>
</template>
