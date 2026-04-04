<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();

const account = ref('');
const password = ref('');
const loginError = ref('');
const loginLoading = ref(false);

function fillDemo(who) {
  const map = { admin: ['admin', '1234'], emp1: ['emp1', '1234'], emp2: ['emp2', '1234'] };
  [account.value, password.value] = map[who];
  loginError.value = '';
}

async function doLogin() {
  loginError.value = '';
  if (!account.value || !password.value) {
    loginError.value = '請輸入帳號與密碼';
    return;
  }
  loginLoading.value = true;
  try {
    const data = await auth.login(account.value, password.value);
    if (data.success) {
      router.push('/dashboard');
    } else {
      loginError.value = data.message;
    }
  } catch {
    loginError.value = '無法連線到伺服器';
  } finally {
    loginLoading.value = false;
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
        <div class="login-logo-text">
          <h1>某某醫院</h1>
          <p>人事管理資訊系統</p>
        </div>
      </div>
      <div class="login-subtitle">登入帳號</div>
      <div class="login-desc">請使用您的員工帳號進行登入</div>
      <div class="alert alert-danger" v-if="loginError">{{ loginError }}</div>
      <div class="form-group">
        <label>帳號</label>
        <input class="form-control" :class="{ error: loginError }" v-model="account"
          placeholder="請輸入員工帳號" @keyup.enter="doLogin" />
      </div>
      <div class="form-group">
        <label>密碼</label>
        <input class="form-control" :class="{ error: loginError }" type="password"
          v-model="password" placeholder="請輸入密碼" @keyup.enter="doLogin" />
      </div>
      <button class="btn btn-primary btn-block" @click="doLogin" :disabled="loginLoading">
        <span v-if="loginLoading" class="loading-spinner"></span>
        {{ loginLoading ? '登入中...' : '登入系統' }}
      </button>
      <div class="demo-accounts">
        <p>示範帳號（點擊快速填入）</p>
        <div class="demo-row">
          <div class="demo-tag" @click="fillDemo('admin')">🔐 管理者 admin/1234</div>
          <div class="demo-tag" @click="fillDemo('emp1')">👤 員工 emp1/1234</div>
          <div class="demo-tag" @click="fillDemo('emp2')">👤 員工 emp2/1234</div>
        </div>
      </div>
    </div>
  </div>
</template>
