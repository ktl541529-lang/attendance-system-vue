<script setup>
import { ref, onMounted } from 'vue'
import {
  getAttendanceApi,
  approveAttendanceApi,
  rejectAttendanceApi,
} from '@/api/attendance.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { fmtDate, fmtDay } from '@/utils/format.js'

const records = ref([])
const pageLoading = ref(false)
const saving = ref(false)
const toasts = ref([])
let toastCounter = 0

const showRejectModal = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')
const rejectError = ref('')

const pendingCount = ref(0)
const filter = ref({ keyword: '', type: '' })
const leaveTypes = ['事假', '病假', '年假', '喪假', '公傷假', '生理假', '其他']

let searchTimer = null

function toast(type, msg) {
  const id = ++toastCounter
  toasts.value.push({ id, type, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

async function fetchRecords() {
  const params = { status: 'pending' }
  if (filter.value.keyword) params.keyword = filter.value.keyword
  if (filter.value.type) params.type = filter.value.type
  const data = await getAttendanceApi(params)
  if (data.success) {
    records.value = data.data
    pendingCount.value = data.pagination?.total || 0
  }
}

function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchRecords(), 400)
}

async function doApprove(r) {
  saving.value = true
  try {
    const data = await approveAttendanceApi(r.id)
    if (data.success) {
      toast('success', data.message)
      await fetchRecords()
    } else {
      toast('error', data.message)
    }
  } finally {
    saving.value = false
  }
}

function openRejectModal(r) {
  rejectTarget.value = r
  rejectReason.value = ''
  rejectError.value = ''
  showRejectModal.value = true
}

async function doReject() {
  if (!rejectReason.value.trim()) { rejectError.value = '請填寫拒絕原因'; return }
  saving.value = true
  try {
    const data = await rejectAttendanceApi(rejectTarget.value.id, {
      reject_reason: rejectReason.value,
    })
    if (data.success) {
      toast('warning', data.message)
      showRejectModal.value = false
      await fetchRecords()
    } else {
      rejectError.value = data.message
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  pageLoading.value = true
  await fetchRecords()
  pageLoading.value = false
})
</script>

<template>
  <AppLayout>
    <!-- Toast -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="'toast-' + t.type">
        <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : '!' }}</span>{{ t.msg }}
      </div>
    </div>

    <div class="page-header">
      <div>
        <div class="page-title">審核管理</div>
        <div class="page-desc">待審核的出勤申請</div>
      </div>
      <span class="badge badge-pending" style="font-size:13px;padding:6px 14px">
        待審核 {{ pendingCount }} 筆
      </span>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input class="form-control" v-model="filter.keyword"
          placeholder="🔍 搜尋員工、事由..." @input="debounceSearch" />
        <select class="form-control" v-model="filter.type" @change="fetchRecords">
          <option value="">全部類型</option>
          <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div v-if="pageLoading" style="text-align:center;padding:40px;color:var(--text-3)">
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
              <th>日期區間</th>
              <th>事由</th>
              <th>申請時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0">
              <td colspan="8">
                <div class="empty-state"><p>目前沒有待審核的申請</p></div>
              </td>
            </tr>
            <tr v-for="r in records" :key="r.id">
              <td class="text-mono text-sm">#{{ r.id }}</td>
              <td><strong>{{ r.user_name }}</strong></td>
              <td class="text-sm">{{ r.dept }}</td>
              <td><span class="chip">{{ r.type }}</span></td>
              <td class="text-mono text-sm">{{ fmtDay(r.start_date) }} ~ {{ fmtDay(r.end_date) }}</td>
              <td>{{ r.reason }}</td>
              <td class="text-sm">{{ fmtDate(r.created_at) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-success btn-sm" @click="doApprove(r)">✓ 核准</button>
                  <button class="btn btn-danger btn-sm" @click="openRejectModal(r)">✗ 退回</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-overlay" v-if="showRejectModal" @click.self="showRejectModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">退回申請</div>
          <button class="modal-close" @click="showRejectModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            退回 <strong>{{ rejectTarget?.user_name }}</strong> 的申請
            （{{ rejectTarget?.type }}，
            {{ fmtDay(rejectTarget?.start_date) }} ~ {{ fmtDay(rejectTarget?.end_date) }}）
          </div>
          <div class="form-group">
            <label>退回原因 <span style="color:var(--danger)">*</span></label>
            <textarea class="form-control" v-model="rejectReason"
              placeholder="請輸入退回原因..." rows="4"></textarea>
          </div>
          <div v-if="rejectError" class="field-error">{{ rejectError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showRejectModal = false">取消</button>
          <button class="btn btn-danger" @click="doReject" :disabled="saving">
            <span v-if="saving" class="loading-spinner"></span>確認退回
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
