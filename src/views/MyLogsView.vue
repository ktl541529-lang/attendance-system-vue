<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { fmtDate, actionLabel } from '@/utils/format.js'
import { getMyLogsApi } from '@/api/logs.js'

// 狀態
const logs = ref([])
const pageLoading = ref(false)
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })

// 將 log 轉成「使用者看得懂的格式」
function formatUserLog(log) {
  return {
    id: log.id,
    time: fmtDate(log.created_at),
    action: actionLabel(log.action),
    result: log.status === 'SUCCESS' ? '成功' : '失敗',
    resultClass: log.status === 'SUCCESS' ? 'text-success' : 'text-danger',
    note: formatDetail(log)
  }
}

// 將 detail 轉成人話（可自行擴充）
function formatDetail(log) {
  if (log.action === 'CLOCK_IN' && log.status === 'FAIL') {
    return '未在可打卡時間內，請申請補打卡'
  }

  if (log.action === 'CLOCK_OUT' && log.status === 'FAIL') {
    return '尚未達下班時間或重複打卡'
  }

  if (log.action === 'LEAVE_APPLY') {
    return '已送出請假申請'
  }

  return log.detail || '—'
}

// 取得資料
async function fetchLogs(page = 1) {
  const params = { page, limit: pagination.value.limit }
  const data = await getMyLogsApi(params)

  if (data.success) {
    const rawLogs = data.data || []

    // 在這裡做轉換
    logs.value = rawLogs.map(formatUserLog)

    const total = data.pagination?.total || 0
    const limit = pagination.value.limit

    pagination.value = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}

onMounted(async () => {
  pageLoading.value = true
  await fetchLogs()
  pageLoading.value = false
})
</script>

<template>
  <AppLayout>
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">我的操作紀錄</div>
        <div class="page-desc">共 {{ pagination.total }} 筆紀錄</div>
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <!-- Loading -->
      <div v-if="pageLoading" style="text-align:center;padding:40px">
        <span class="loading-spinner" style="width:24px;height:24px"></span>
      </div>

      <!-- Table -->
      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>操作</th>
              <th>結果</th>
              <th>說明</th>
            </tr>
          </thead>

          <tbody>
            <!-- Empty -->
            <tr v-if="logs.length === 0">
              <td colspan="4">
                <div class="empty-state">
                  <p>目前沒有紀錄</p>
                </div>
              </td>
            </tr>

            <!-- Data -->
            <tr v-for="log in logs" :key="log.id">
              <td class="text-sm">{{ log.time }}</td>

              <td>
                <strong>{{ log.action }}</strong>
              </td>

              <td>
                <span :class="log.resultClass">
                  {{ log.result }}
                </span>
              </td>

              <td class="text-sm" style="max-width:300px">
                {{ log.note }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button
          class="btn btn-outline btn-sm"
          :disabled="pagination.page <= 1"
          @click="fetchLogs(pagination.page - 1)"
        >
          ← 上一頁
        </button>

        <span style="font-size:13px;color:var(--text-2)">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 頁
        </span>

        <button
          class="btn btn-outline btn-sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="fetchLogs(pagination.page + 1)"
        >
          下一頁 →
        </button>
      </div>
    </div>
  </AppLayout>
</template>