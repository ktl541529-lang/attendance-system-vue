<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import {
  getAttendanceApi,
  createAttendanceApi,
  updateAttendanceApi,
  deleteAttendanceApi,
} from '@/api/attendance.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import FormModal from '@/components/ui/FormModal.vue'
import { fmtDate, fmtDay, statusBadge, statusLabel } from '@/utils/format.js'

const auth = useAuthStore()

const records = ref([])
const pageLoading = ref(false)
const showFormModal = ref(false)
const editingRecord = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const saving = ref(false)
const toasts = ref([])
let toastCounter = 0

const filter = ref({ keyword: '', status: '', type: '', date_from: '', date_to: '' })
const leaveTypes = ['事假', '病假', '年假', '喪假', '公傷假', '生理假', '其他']

let searchTimer = null

function toast(type, msg) {
  const id = ++toastCounter
  toasts.value.push({ id, type, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

async function fetchRecords() {
  const params = {}
  if (filter.value.keyword) params.keyword = filter.value.keyword
  if (filter.value.status) params.status = filter.value.status
  if (filter.value.type) params.type = filter.value.type
  if (filter.value.date_from) params.date_from = filter.value.date_from
  if (filter.value.date_to) params.date_to = filter.value.date_to
  const data = await getAttendanceApi(params)
  if (data.success) records.value = data.data
}

function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchRecords(), 400)
}

function openNewModal() {
  editingRecord.value = null
  showFormModal.value = true
}

function openEditModal(r) {
  if (r.status !== 'pending') { toast('warning', '只能編輯待審核的申請'); return }
  editingRecord.value = r
  showFormModal.value = true
}

async function onSaved(formData, done) {
  try {
    let data
    if (editingRecord.value) {
      data = await updateAttendanceApi(editingRecord.value.id, formData)
    } else {
      data = await createAttendanceApi(formData)
    }
    if (data.success) {
      toast('success', data.message)
      showFormModal.value = false
      await fetchRecords()
    } else {
      toast('error', data.message)
    }
  } catch {
    toast('error', '操作失敗，請稍後再試')
  } finally {
    done()
  }
}

function confirmDelete(r) {
  if (r.status === 'approved') { toast('error', '已核准的申請無法刪除'); return }
  deleteTarget.value = r
  showDeleteModal.value = true
}

async function doDelete() {
  saving.value = true
  try {
    const data = await deleteAttendanceApi(deleteTarget.value.id)
    if (data.success) {
      toast('success', data.message)
      showDeleteModal.value = false
      await fetchRecords()
    } else {
      toast('error', data.message)
      showDeleteModal.value = false
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
        <div class="page-title">我的申請</div>
        <div class="page-desc">管理您的出勤申請記錄</div>
      </div>
      <button class="btn btn-primary" @click="openNewModal">+ 新增申請</button>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input class="form-control" v-model="filter.keyword"
          placeholder="🔍 關鍵字搜尋..." @input="debounceSearch" />
        <select class="form-control" v-model="filter.status" @change="fetchRecords">
          <option value="">全部狀態</option>
          <option value="pending">申請中</option>
          <option value="approved">已核准</option>
          <option value="rejected">已退回</option>
        </select>
        <select class="form-control" v-model="filter.type" @change="fetchRecords">
          <option value="">全部類型</option>
          <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <input type="date" class="form-control" v-model="filter.date_from" @change="fetchRecords" />
        <input type="date" class="form-control" v-model="filter.date_to" @change="fetchRecords" />
      </div>

      <div v-if="pageLoading" style="text-align:center;padding:40px;color:var(--text-3)">
        <span class="loading-spinner" style="width:24px;height:24px"></span>
      </div>

      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr>
              <th>編號</th>
              <th>類型</th>
              <th>開始</th>
              <th>結束</th>
              <th>事由</th>
              <th>狀態</th>
              <th>退回原因</th>
              <th>申請時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0">
              <td colspan="9"><div class="empty-state"><p>查無符合條件的申請記錄</p></div></td>
            </tr>
            <tr v-for="r in records" :key="r.id">
              <td class="text-mono text-sm">#{{ r.id }}</td>
              <td><span class="chip">{{ r.type }}</span></td>
              <td class="text-mono text-sm">{{ fmtDay(r.start_date) }}</td>
              <td class="text-mono text-sm">{{ fmtDay(r.end_date) }}</td>
              <td>{{ r.reason }}</td>
              <td><span class="badge" :class="statusBadge(r.status)">{{ statusLabel(r.status) }}</span></td>
              <td style="font-size:12px;color:var(--danger)">{{ r.reject_reason || '—' }}</td>
              <td class="text-sm">{{ fmtDate(r.created_at) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-outline btn-sm"
                    :disabled="r.status !== 'pending'" @click="openEditModal(r)">編輯</button>
                  <button class="btn btn-danger btn-sm"
                    :disabled="r.status === 'approved'" @click="confirmDelete(r)">刪除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <FormModal
      :show="showFormModal"
      :editingRecord="editingRecord"
      @close="showFormModal = false"
      @saved="onSaved"
    />

    <!-- Delete Modal -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <div class="modal-title">確認刪除</div>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger">確定要刪除此申請記錄嗎？此操作無法復原。</div>
          <p style="font-size:13px;color:var(--text-2)">
            類型：<strong>{{ deleteTarget?.type }}</strong><br>
            日期：{{ fmtDay(deleteTarget?.start_date) }} ~ {{ fmtDay(deleteTarget?.end_date) }}<br>
            事由：{{ deleteTarget?.reason }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="saving">
            <span v-if="saving" class="loading-spinner"></span>確認刪除
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
