<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { getAttendanceApi } from '@/api/attendance.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { fmtDate, fmtDay, statusBadge, statusLabel } from '@/utils/format.js'
import { Pie, Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
);
const auth = useAuthStore();
const records = ref([]);
const allRecords = ref([]);
const stats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 });
const pendingCount = ref(0);
const pageLoading = ref(false);

// ── 一般員工圖表資料 ──────────────────────────
const myStatusChart = computed(() => ({
  labels: ['申請中', '已核准', '已退回'],
  datasets: [
    {
      data: [
        records.value.filter((r) => r.status === 'pending').length,
        records.value.filter((r) => r.status === 'approved').length,
        records.value.filter((r) => r.status === 'rejected').length,
      ],
      backgroundColor: ['#a78bfa', '#34d399', '#f87171'],
      borderWidth: 0,
    },
  ],
}));

const myTypeChart = computed(() => {
  const types = [
    '特休',
    '病假',
    '事假',
    '公假',
    '育嬰留停',
    '加班補休',
    '其他',
  ];
  return {
    labels: types,
    datasets: [
      {
        label: '申請次數',
        data: types.map(
          (t) => records.value.filter((r) => r.type === t).length,
        ),
        backgroundColor: '#6097d8',
        borderRadius: 6,
      },
    ],
  };
});

const myMonthlyChart = computed(() => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  return {
    labels: months.map((m) => m.slice(5) + '月'),
    datasets: [
      {
        label: '申請筆數',
        data: months.map(
          (m) =>
            records.value.filter((r) => fmtDay(r.start_date).startsWith(m))
              .length,
        ),
        borderColor: '#6097d8',
        backgroundColor: 'rgba(96,151,216,0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6097d8',
      },
    ],
  };
});

// ── 管理者圖表資料 ──────────────────────────
const allStatusChart = computed(() => ({
  labels: ['申請中', '已核准', '已退回'],
  datasets: [
    {
      data: [stats.value.pending, stats.value.approved, stats.value.rejected],
      backgroundColor: ['#a78bfa', '#34d399', '#f87171'],
      borderWidth: 0,
    },
  ],
}));

const deptChart = computed(() => {
  const depts = [
    ...new Set(allRecords.value.map((r) => r.dept).filter(Boolean)),
  ];
  return {
    labels: depts,
    datasets: [
      {
        label: '申請總數',
        data: depts.map(
          (d) => allRecords.value.filter((r) => r.dept === d).length,
        ),
        backgroundColor: [
          '#6097d8',
          '#34d399',
          '#a78bfa',
          '#f59e0b',
          '#f87171',
          '#22d3ee',
        ],
        borderRadius: 6,
      },
    ],
  };
});

const allTypeChart = computed(() => {
  const types = [
    '特休',
    '病假',
    '事假',
    '公假',
    '育嬰留停',
    '加班補休',
    '其他',
  ];
  return {
    labels: types,
    datasets: [
      {
        label: '申請次數',
        data: types.map(
          (t) => allRecords.value.filter((r) => r.type === t).length,
        ),
        backgroundColor: '#a78bfa',
        borderRadius: 6,
      },
    ],
  };
});

const allMonthlyChart = computed(() => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  return {
    labels: months.map((m) => m.slice(5) + '月'),
    datasets: [
      {
        label: '申請筆數',
        data: months.map(
          (m) =>
            allRecords.value.filter((r) => fmtDay(r.start_date).startsWith(m))
              .length,
        ),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#34d399',
      },
    ],
  };
});

const chartOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
    title: {
      display: !!title,
      text: title,
      font: { size: 13 },
      padding: { bottom: 12 },
    },
  },
  scales: undefined,
});

const barOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: !!title,
      text: title,
      font: { size: 13 },
      padding: { bottom: 12 },
    },
  },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
});

const lineOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: !!title,
      text: title,
      font: { size: 13 },
      padding: { bottom: 12 },
    },
  },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
});

onMounted(async () => {
  pageLoading.value = true;
  const [myData, pendingData] = await Promise.all([
  getAttendanceApi({}),
  getAttendanceApi({ status: 'pending', limit: 1 }),
])
  if (myData.success) records.value = myData.data;
  stats.value = {
    total: myData.pagination?.total || records.value.length,
    pending: records.value.filter((r) => r.status === 'pending').length,
    approved: records.value.filter((r) => r.status === 'approved').length,
    rejected: records.value.filter((r) => r.status === 'rejected').length,
  };
  if (auth.isAdmin) {
    pendingCount.value = pendingData.pagination?.total || 0;
    allRecords.value = records.value;
  }
  pageLoading.value = false;
});
</script>

<template>
  <AppLayout>
    <div
      v-if="pageLoading"
      style="text-align: center; padding: 60px; color: var(--text-3)"
    >
      <span
        class="loading-spinner"
        style="width: 32px; height: 32px; border-width: 3px"
      ></span>
      <p style="margin-top: 16px">載入中...</p>
    </div>

    <div v-else>
      <!-- 統計卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e8f0fb">
            <svg viewBox="0 0 24 24" fill="#1a56a4">
              <path
                d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
              />
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">申請總數</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--pending-bg)">
            <svg viewBox="0 0 24 24" fill="var(--pending)">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">申請中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--success-bg)">
            <svg viewBox="0 0 24 24" fill="var(--success)">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.approved }}</div>
            <div class="stat-label">已核准</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--danger-bg)">
            <svg viewBox="0 0 24 24" fill="var(--danger)">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats.rejected }}</div>
            <div class="stat-label">已退回</div>
          </div>
        </div>
        <div v-if="auth.isAdmin" class="stat-card">
          <div class="stat-icon" style="background: #fff8e1">
            <svg viewBox="0 0 24 24" fill="#f59e0b">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">全部待審核</div>
          </div>
        </div>
      </div>

      <!-- 管理者專屬圖表 -->
      <template v-if="auth.isAdmin">
        <div
          class="section-title"
          style="
            margin: 24px 0 12px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-2);
          "
        >
          🔐 全體員工分析（管理者專屬）
        </div>
        <div class="charts-grid">
          <div class="card chart-card">
            <div class="chart-title">全體申請狀態分佈</div>
            <div class="chart-wrap">
              <Pie :data="allStatusChart" :options="chartOptions('')" />
            </div>
          </div>
          <div class="card chart-card">
            <div class="chart-title">各部門申請數量</div>
            <div class="chart-wrap">
              <Bar :data="deptChart" :options="barOptions('')" />
            </div>
          </div>
          <div class="card chart-card">
            <div class="chart-title">各假別使用統計</div>
            <div class="chart-wrap">
              <Bar :data="allTypeChart" :options="barOptions('')" />
            </div>
          </div>
          <div class="card chart-card chart-card--wide">
            <div class="chart-title">近 6 個月全體申請趨勢</div>
            <div class="chart-wrap">
              <Line :data="allMonthlyChart" :options="lineOptions('')" />
            </div>
          </div>
        </div>
      </template>

      <!-- 最近申請 -->
      <div
        class="section-title"
        style="
          margin: 24px 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-2);
        "
      >
        📋 最近申請
      </div>
      <div class="card">
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
                <td colspan="5">
                  <div class="empty-state"><p>尚無申請記錄</p></div>
                </td>
              </tr>
              <tr v-for="r in records.slice(0, 5)" :key="r.id">
                <td>
                  <span class="chip">{{ r.type }}</span>
                </td>
                <td class="text-mono text-sm">
                  {{ r.start_date?.split('T')[0] }} ~
                  {{ r.end_date?.split('T')[0] }}
                </td>
                <td>{{ r.reason }}</td>
                <td>
                  <span class="badge" :class="statusBadge(r.status)">{{
                    statusLabel(r.status)
                  }}</span>
                </td>
                <td class="text-sm">{{ fmtDate(r.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 我的圖表（所有人可見） -->
      <div
        class="section-title"
        style="
          margin: 24px 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-2);
        "
      >
        📊 我的申請分析
      </div>
      <div class="charts-grid">
        <div class="card chart-card">
          <div class="chart-title">申請狀態分佈</div>
          <div class="chart-wrap">
            <Pie :data="myStatusChart" :options="chartOptions('')" />
          </div>
        </div>
        <div class="card chart-card">
          <div class="chart-title">假別使用統計</div>
          <div class="chart-wrap">
            <Bar :data="myTypeChart" :options="barOptions('')" />
          </div>
        </div>
        <div class="card chart-card chart-card--wide">
          <div class="chart-title">近 6 個月申請趨勢</div>
          <div class="chart-wrap">
            <Line :data="myMonthlyChart" :options="lineOptions('')" />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
