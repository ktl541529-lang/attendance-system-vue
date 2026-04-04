<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/index.js';
import AppLayout from '@/components/layout/AppLayout.vue';

const users = ref([]);
const pageLoading = ref(false);
const saving = ref(false);
const toasts = ref([]);
let toastCounter = 0;

const showModal = ref(false);
const editingUser = ref(null);
const showDeleteModal = ref(false);
const deleteTarget = ref(null);

const form = ref({ username: '', name: '', password: '', dept: '', role: 'employee' });
const formError = ref('');

const depts = ['人資部', '護理部', '急診部', '放射科', '行政部', '其他'];

function toast(type, msg) {
  const id = ++toastCounter;
  toasts.value.push({ id, type, msg });
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, 3500);
}

function openNewModal() {
  editingUser.value = null;
  form.value = { username: '', name: '', password: '', dept: '', role: 'employee' };
  formError.value = '';
  showModal.value = true;
}

function openEditModal(u) {
  editingUser.value = u;
  form.value = { username: u.account, name: u.name, password: '', dept: u.dept, role: u.role };
  formError.value = '';
  showModal.value = true;
}

function validate() {
  if (!form.value.username) return '請填寫帳號';
  if (!form.value.name) return '請填寫姓名';
  if (!editingUser.value && !form.value.password) return '請填寫密碼';
  if (!form.value.dept) return '請選擇部門';
  return '';
}

async function onSubmit() {
  formError.value = validate();
  if (formError.value) return;
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (!payload.password) delete payload.password;
    let data;
    if (editingUser.value) {
      data = await api.put(`/users/${editingUser.value.id}`, payload);
    } else {
      data = await api.post('/users', payload);
    }
    if (data.success) {
      toast('success', data.message);
      showModal.value = false;
      await fetchUsers();
    } else {
      formError.value = data.message;
    }
  } finally {
    saving.value = false;
  }
}

function confirmDelete(u) {
  deleteTarget.value = u;
  showDeleteModal.value = true;
}

async function doDelete() {
  saving.value = true;
  try {
    const data = await api.delete(`/users/${deleteTarget.value.id}`);
    if (data.success) {
      toast('success', data.message);
      showDeleteModal.value = false;
      await fetchUsers();
    } else {
      toast('error', data.message);
      showDeleteModal.value = false;
    }
  } finally {
    saving.value = false;
  }
}

async function fetchUsers() {
  const data = await api.get('/users');
  if (data.success) users.value = data.data;
}

onMounted(async () => {
  pageLoading.value = true;
  await fetchUsers();
  pageLoading.value = false;
});
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
        <div class="page-title">員工帳號管理</div>
        <div class="page-desc">共 {{ users.length }} 位員工</div>
      </div>
      <button class="btn btn-primary" @click="openNewModal">+ 新增員工</button>
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
              <th>帳號</th>
              <th>姓名</th>
              <th>部門</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6"><div class="empty-state"><p>目前沒有員工資料</p></div></td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td class="text-mono text-sm">#{{ u.id }}</td>
              <td class="text-mono">{{ u.account }}</td>
              <td><strong>{{ u.name }}</strong></td>
              <td class="text-sm">{{ u.dept }}</td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'role-admin' : 'role-employee'">
                  {{ u.role === 'admin' ? '管理者' : '一般員工' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-outline btn-sm" @click="openEditModal(u)">編輯</button>
                  <button class="btn btn-danger btn-sm" @click="confirmDelete(u)">刪除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/編輯 Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ editingUser ? '編輯員工' : '新增員工' }}</div>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
          <div class="form-row">
            <div class="form-group">
              <label>帳號 <span style="color:var(--danger)">*</span></label>
              <input class="form-control" v-model="form.username"
                placeholder="登入帳號" :disabled="!!editingUser" />
            </div>
            <div class="form-group">
              <label>姓名 <span style="color:var(--danger)">*</span></label>
              <input class="form-control" v-model="form.name" placeholder="員工姓名" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>密碼 {{ editingUser ? '（留空不修改）' : '*' }}</label>
              <input type="password" class="form-control" v-model="form.password"
                :placeholder="editingUser ? '留空表示不修改' : '請輸入密碼'" />
            </div>
            <div class="form-group">
              <label>部門 <span style="color:var(--danger)">*</span></label>
              <select class="form-control" v-model="form.dept">
                <option value="">請選擇部門</option>
                <option v-for="d in depts" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>角色</label>
            <select class="form-control" v-model="form.role">
              <option value="employee">一般員工</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="onSubmit" :disabled="saving">
            <span v-if="saving" class="loading-spinner"></span>
            {{ saving ? '處理中...' : (editingUser ? '儲存修改' : '新增員工') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Modal -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <div class="modal-title">確認刪除</div>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger">確定要刪除此員工帳號嗎？此操作無法復原。</div>
          <p style="font-size:13px;color:var(--text-2)">
            帳號：<strong>{{ deleteTarget?.account }}</strong>
            姓名：{{ deleteTarget?.name }}<br>
            部門：{{ deleteTarget?.dept }}
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
