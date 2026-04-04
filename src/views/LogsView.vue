<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/index.js';
import AppLayout from '../components/AppLayout.vue';

const logs = ref([]);
const pageLoading = ref(false);
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 });

function fmtDate(d) {
  return d ? new Date(d).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).replace(/\//g, '-') : '—';
}

function actionLabel(action) {
  const map = {
    login: '登入',
    logout: '登出',
    create_request: '新增申請',
    update_request: '編輯申請',
    delete_request: '刪除申請',
    approve_request: '核准申請',
    reject_request: '退回申請',
    create_user: '新增員工',
    update_user: '編輯員工',
    delete_user: '刪除員工',
  };
  return map[action] || action;
}

function actionBadgeClass(action) {
  if (action.includes('approve')) return 'badge-approved';
  if (action.includes('reject') || action.includes('delete')) return 'badge-rejected';
  if (action.includes('create')) return 'badge-pending';
  return '';
}

async function fetchLogs(page = 1) {
  const params = {
    page,
    limit: pagination.value.limit,
  };

  const data = await api.get('/users/audit-logs', { params });
  if (data.success) {
    logs.value = data.data;
    const total = data.pagination?.total || 0;
    const limit = pagination.value.limit;
    pagination.value = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

onMounted(async () => {
  pageLoading.value = true;
  await fetchLogs();
  pageLoading.value = false;
});
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <div>
        <div class="page-title">操作紀錄</div>
        <div class="page-desc">共 {{ pagination.total }} 筆紀錄</div>
      </div>
    </div>

    <div class="card">
      <div v-if="pageLoading" style="text-align:center;padding:40px">
        <span class="loading-spinner" style="width:24px;height:24px"></span>
      </div>

      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr>
              <th>編號</th>
              <th>操作者</th>
              <th>動作</th>
              <th>對象</th>
              <th>詳情</th>
              <th>IP</th>
              <th>時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="7">
                <div class="empty-state"><p>目前沒有操作紀錄</p></div>
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="text-mono text-sm">#{{ log.id }}</td>
              <td><strong>{{ log.actor_name }}</strong></td>
              <td>
                <span class="badge" :class="actionBadgeClass(log.action)">
                  {{ actionLabel(log.action) }}
                </span>
              </td>
              <td class="text-mono text-sm">{{ log.target_id ? '#' + log.target_id : '—' }}</td>
              <td class="text-sm" style="max-width:300px">{{ log.detail || '—' }}</td>
              <td class="text-mono text-sm">{{ log.ip_address || '—' }}</td>
              <td class="text-sm">{{ fmtDate(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="pagination.totalPages > 1">
        <button class="btn btn-outline btn-sm"
          :disabled="pagination.page <= 1"
          @click="fetchLogs(pagination.page - 1)">← 上一頁</button>
        <span style="font-size:13px;color:var(--text-2)">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 頁
        </span>
        <button class="btn btn-outline btn-sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="fetchLogs(pagination.page + 1)">下一頁 →</button>
      </div>
    </div>
  </AppLayout>
</template>