<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { api } from '../api/index.js';
import AppLayout from '../components/AppLayout.vue';

const auth = useAuthStore();
const router = useRouter();

const records = ref([]);
const stats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 });
const pendingCount = ref(0);
const pageLoading = ref(false);

const leaveTypes = ['特休', '病假', '事假', '公假', '育嬰留停', '加班補休', '其他'];

function statusBadge(s) {
  return { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' }[s];
}
function statusLabel(s) {
  return { pending: '申請中', approved: '已核准', rejected: '已退回' }[s] || s;
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).replace(/\//g, '-') : '—';
}

async function fetchStats() {
  const [all, pending, approved, rejected] = await Promise.all([
    api('GET', '/attendance?limit=1'),
    api('GET', '/attendance?status=pending&limit=1'),
    api('GET', '/attendance?status=approved&limit=1'),
    api('GET', '/attendance?status=rejected&limit=1'),
  ]);
  stats.value = {
    total: all.pagination?.total || 0,
    pending: pending.pagination?.total || 0,
    approved: approved.pagination?.total || 0,
    rejected: rejected.pagination?.total || 0,
  };
}

async function fetchRecords() {
  const data = await api('GET', '/attendance');
  if (data.success) records.value = data.data;
}

async function fetchPendingCount() {
  const data = await api('GET', '/attendance?status=pending&limit=1');
  if (data.success) pendingCount.value = data.pagination?.total || 0;
}

onMounted(async () => {
  pageLoading.value = true;
  await fetchRecords();
  await fetchStats();
  if (auth.isAdmin) await fetchPendingCount();
  pageLoading.value = false;
});
</script>

<template>
  <AppLayout>
    <div v-if="pageLoading" style="text-align:center;padding:60px;color:var(--text-3)">
      <span class="loading-spinner" style="width:32px;height:32px;border-width:3px"></span>
      <p style="margin-top:16px">載入中...</p>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f0fb">
            <svg viewBox="0 0 24 24" fill="#1a56a4"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">申請總數</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--pending-bg)">
            <svg viewBox="0 0 24 24" fill="var(--pending)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">申請中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--success-bg)">
            <svg viewBox="0 0 24 24" fill="var(--success)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.approved }}</div>
            <div class="stat-label">已核准</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--danger-bg)">
            <svg viewBox="0 0 24 24" fill="var(--danger)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.rejected }}</div>
            <div class="stat-label">已退回</div>
          </div>
        </div>
        <div v-if="auth.isAdmin" class="stat-card">
          <div class="stat-icon" style="background:#fff8e1">
            <svg viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">全部待審核</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">最近申請</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>類型</th>
                <th>日期區間</th>
                <th>事由</th>
                <th>狀態</th>
                <th>申請日</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="records.length === 0">
                <td colspan="5"><div class="empty-state"><p>尚無申請記錄</p></div></td>
              </tr>
              <tr v-for="r in records.slice(0, 5)" :key="r.id">
                <td><span class="chip">{{ r.type }}</span></td>
                <td class="text-mono text-sm">{{ r.start_date }} ~ {{ r.end_date }}</td>
                <td>{{ r.reason }}</td>
                <td><span class="badge" :class="statusBadge(r.status)">{{ statusLabel(r.status) }}</span></td>
                <td class="text-sm">{{ fmtDate(r.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>