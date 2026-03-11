<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  editingRecord: Object,
});

const emit = defineEmits(['close', 'saved']);

const leaveTypes = ['特休', '病假', '事假', '公假', '育嬰留停', '加班補休', '其他'];

const form = ref({ type: '', start_date: '', end_date: '', reason: '', proxy_name: '' });
const formError = ref('');
const saving = ref(false);

watch(() => props.show, (val) => {
  if (val) {
    if (props.editingRecord) {
      form.value = {
        type: props.editingRecord.type,
        start_date: props.editingRecord.start_date,
        end_date: props.editingRecord.end_date,
        reason: props.editingRecord.reason,
        proxy_name: props.editingRecord.proxy_name || ''
      };
    } else {
      form.value = { type: '', start_date: '', end_date: '', reason: '', proxy_name: '' };
    }
    formError.value = '';
  }
});

function validate() {
  if (!form.value.type) return '請選擇申請類型';
  if (!form.value.start_date) return '請填寫開始日期';
  if (!form.value.end_date) return '請填寫結束日期';
  if (form.value.start_date > form.value.end_date) return '結束日期不得早於開始日期';
  if (!form.value.reason || form.value.reason.length < 10) return '事由至少需10字';
  return '';
}

async function submit() {
  formError.value = validate();
  if (formError.value) return;
  saving.value = true;
  emit('saved', { ...form.value }, () => { saving.value = false; });
}
</script>

<template>
  <div class="modal-overlay" v-if="show" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">{{ editingRecord ? '編輯申請' : '新增申請' }}</div>
        <button class="modal-close" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
        <div class="form-group">
          <label>申請類型 <span style="color:var(--danger)">*</span></label>
          <select class="form-control" v-model="form.type">
            <option value="">請選擇</option>
            <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>開始日期 <span style="color:var(--danger)">*</span></label>
            <input type="date" class="form-control" v-model="form.start_date" />
          </div>
          <div class="form-group">
            <label>結束日期 <span style="color:var(--danger)">*</span></label>
            <input type="date" class="form-control" v-model="form.end_date" />
          </div>
        </div>
        <div class="form-group">
          <label>事由說明 <span style="color:var(--danger)">*</span></label>
          <textarea class="form-control" v-model="form.reason"
            placeholder="請說明申請事由（10~200字）" rows="3"></textarea>
          <div class="text-sm mt-2">{{ form.reason.length }} / 200 字</div>
        </div>
        <div class="form-group">
          <label>代理人</label>
          <input class="form-control" v-model="form.proxy_name" placeholder="代理人姓名（選填）" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="emit('close')">取消</button>
        <button class="btn btn-primary" @click="submit" :disabled="saving">
          <span v-if="saving" class="loading-spinner"></span>
          {{ saving ? '處理中...' : (editingRecord ? '儲存修改' : '送出申請') }}
        </button>
      </div>
    </div>
  </div>
</template>