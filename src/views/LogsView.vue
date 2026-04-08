<script setup>
import { ref, onMounted } from 'vue';
import { getAuditLogsApi } from '@/api/logs.js';
import AppLayout from '@/components/layout/AppLayout.vue';
import { fmtDate, actionLabel, actionBadgeClass } from '@/utils/format.js';

const logs = ref([]);
const pageLoading = ref(false);
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 });

async function fetchLogs(page = 1) {
  pageLoading.value = true;
  const params = { page, limit: pagination.value.limit };
  try {
    const data = await getAuditLogsApi(params);
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
  } catch (err) {
    console.error('fetchLogs error:', err);
  } finally {
    pageLoading.value = false;
  }
}

onMounted(() => fetchLogs());
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
      <div v-if="pageLoading" style="text-align: center; padding: 40px">
        <span class="loading-spinner" style="width: 24px; height: 24px"></span>
      </div>

      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr>
              <th>編號</th>
              <th>操作者</th>
              <th>動作</th>
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
            <tr v-if="logs.length === 0">
              <td colspan="6">
                <div class="empty-state"><p>目前沒有操作紀錄</p></div>
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="text-mono text-sm">#{{ log.id }}</td>
              <td>
                <strong>{{ log.actor_name }}</strong>
              </td>
              <td>
                <span class="badge" :class="actionBadgeClass(log.action)">
                  {{ actionLabel(log.action) }}
                </span>
                <span class="text-sm" style="color: var(--text-2)">{{
                  log.action
                }}</span>
              </td>
              <td class="text-sm" style="max-width: 300px">
                {{ log.detail || '—' }}
              </td>
              <td class="text-mono text-sm">{{ log.ip_address || '—' }}</td>
              <td class="text-sm">{{ fmtDate(log.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="pagination.totalPages > 1">
        <button
          class="btn btn-outline btn-sm"
          :disabled="pagination.page <= 1"
          @click="fetchLogs(pagination.page - 1)"
        >
          ← 上一頁
        </button>
        <span style="font-size: 13px; color: var(--text-2)">
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
