<template>
  <el-form
    ref="form"
    :model="options"
    label-width="200px"
    :rules="rules"
  >
    <el-form-item label="使用自定义密钥">
      <el-checkbox v-model="options.useCustomKey">
        使用自定义密钥
      </el-checkbox>
    </el-form-item>
    <el-form-item v-if="options.useCustomKey" label="输入自定义密钥">
      <div class="form-item-with-tooltip">
        <el-input
          v-model="options.key"
          placeholder="Please input"
          :autosize="customKeyAutoSize"
          type="textarea"
        />
        <el-tooltip
          class="item"
          effect="dark"
          placement="right"
        >
          <template #content>
            1. 非ASCII字符使用UTF-8编码。<br>2. 若勾选“使用自定义密钥”但不输入密钥，则仍使用默认密钥。
          </template>
          <el-icon :size="20">
            <question-filled />
          </el-icon>
        </el-tooltip>
      </div>
    </el-form-item>
    <el-form-item v-if="options.useCustomKey">
      密钥长度：{{ keyLength }}
    </el-form-item>

    <el-form-item>
      <el-checkbox v-model="options.multiRoundEncryption">
        多轮加密
      </el-checkbox>
    </el-form-item>
    <el-form-item
      v-if="options.multiRoundEncryption"
      prop="encryptRoundCount"
      label="加密轮数"
    >
      <div class="form-item-with-tooltip">
        <el-input-number
          v-model="options.encryptRoundCount"
          :min="1"
          :max="10"
          :step="1"
          :precision="0"
        />
        <el-tooltip
          class="item"
          effect="dark"
          :content="`最小为1，最大为${ENCRYPT_ROUND_UPPER_LIMIT}`"
          placement="right"
        >
          <el-icon :size="20">
            <question-filled />
          </el-icon>
        </el-tooltip>
      </div>
    </el-form-item>

    <el-form-item>
      <el-upload
        :on-change="handleSelectFile"
        action=""
        :auto-upload="false"
      >
        <el-button type="primary" :loading="handling" :disabled="handling">
          加密文件<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button v-if="encryptResultBlob" type="primary" @click="save">
        保存文件<el-icon class="el-icon--right"><Download /></el-icon>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import path from 'node:path';
import { Upload, Download, QuestionFilled } from '@element-plus/icons-vue';
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElIcon } from 'element-plus';
import { fileToArrayBuffer, enc } from '../utils/bin';
import { downloadEncryptFile } from '../utils/utils';

const emit = defineEmits(['encrypted']);

const encryptResultBlob = ref(null);
const handling = ref(false);
const options = ref({
  file: null,
  useCustomKey: false,
  multiRoundEncryption: false,
  encryptRoundCount: 1,
  key: '',
});
const ENCRYPT_ROUND_UPPER_LIMIT = ref(10);
const form = ref(null);
const rules = reactive({
  encryptRoundCount: [
    {
      validator(rule, value, callback) {
        if (!value) {
          callback(new Error('Invalid encrypt round'));
          return;
        }
        const s = value.toString();
        if (!/^\d+$/.test(s)) {
          callback(new Error(`Encrypt round should be an integer in range [1, ${ENCRYPT_ROUND_UPPER_LIMIT.value}]`));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
});

const encryptKey = computed(() => (options.value.useCustomKey ? options.value.key : ''));
const keyLength = computed(() => new TextEncoder().encode(options.value.key).length);
const customKeyAutoSize = computed(() => ({ minRows: 3, maxRows: 10 }));
const encryptRoundCount = computed(() => (options.value.multiRoundEncryption ? options.value.encryptRoundCount : 1));

async function encrypt(file) {
  encryptResultBlob.value = null;
  const curArrayBuffer = await fileToArrayBuffer(file.raw);
  const res = enc(curArrayBuffer, encryptKey.value, encryptRoundCount.value);
  encryptResultBlob.value = res.encryptResultBlob;
  emit('encrypted', encryptResultBlob.value);
}

async function handleSelectFile(file) {
  try {
    await form.value.validate();
  } catch (e) {
    ElMessage.error('表单校验未通过！');
    return;
  }
  if (handling.value) return;
  handling.value = true;
  options.value.file = file;
  await encrypt(file);
  handling.value = false;
}

function save() {
  const fileName = `${path.parse(options.value.file.name).name || 'test'}.hctf`;
  downloadEncryptFile(encryptResultBlob.value, fileName);
}
</script>

<script>
export default {
  name: 'Encrypt',
};
</script>

<style lang="less" scoped>
.form-item-with-tooltip {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
