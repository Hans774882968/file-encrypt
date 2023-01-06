<template>
  <el-form
    ref="form"
    :model="options"
    label-width="200px"
    :rules="rules"
  >
    <el-form-item>
      <el-checkbox v-model="options.multiRoundDecryption">
        多轮解密
      </el-checkbox>
    </el-form-item>
    <el-form-item
      v-if="options.multiRoundDecryption"
      prop="decryptRoundCount"
      label="解密轮数"
    >
      <div class="form-item-with-tooltip">
        <el-input-number
          v-model="options.decryptRoundCount"
          :min="1"
          :max="10"
          :step="1"
          :precision="0"
        />
        <el-tooltip
          class="item"
          effect="dark"
          :content="`最小为1，最大为${DECRYPT_ROUND_UPPER_LIMIT}`"
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
          解密文件<el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button v-if="decryptResultBlob" type="primary" @click="save">
        保存文件<el-icon class="el-icon--right"><Download /></el-icon>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import path from 'node:path';
import { ElIcon, ElMessage } from 'element-plus';
import { Upload, Download, QuestionFilled } from '@element-plus/icons-vue';
import { computed, reactive, ref } from 'vue';
import { fileToArrayBuffer, dec } from '../utils/bin';
import { isLegalHCTFFile, getBufferExt } from '../utils/fileJudge';
import { downloadDecryptFile } from '../utils/download';

const emit = defineEmits(['decrypted']);

const options = ref({
  file: null,
  multiRoundDecryption: false,
  decryptRoundCount: 1,
});
const decryptResultData = ref(null);
const decryptResultBlob = ref(null);
const handling = ref(false);
const DECRYPT_ROUND_UPPER_LIMIT = ref(10);
const form = ref(null);
const rules = reactive({
  decryptRoundCount: [
    {
      validator(rule, value, callback) {
        if (!value) {
          callback(new Error('Invalid decrypt round'));
          return;
        }
        const s = value.toString();
        if (!/^\d+$/.test(s)) {
          callback(new Error(`Decrypt round should be an integer in range [1, ${DECRYPT_ROUND_UPPER_LIMIT.value}]`));
          return;
        }
        callback();
      },
      trigger: 'blur',
    },
  ],
});

const decryptRoundCount = computed(() => (options.value.multiRoundDecryption ? options.value.decryptRoundCount : 1));

async function handleSelectFile(_file) {
  try {
    await form.value.validate();
  } catch (e) {
    ElMessage.error('表单校验未通过！');
    return;
  }
  if (handling.value) return;
  handling.value = true;
  options.value.file = _file;
  await decrypt(_file);
  handling.value = false;
}

async function decrypt(file) {
  decryptResultBlob.value = null;
  const curArrayBuffer = await fileToArrayBuffer(file.raw);
  if (!isLegalHCTFFile(curArrayBuffer)) {
    ElMessage.error('不是合法的 .hctf 文件！');
    return;
  }
  const res = dec(curArrayBuffer, decryptRoundCount.value);
  decryptResultData.value = res.decryptResultData;
  decryptResultBlob.value = res.decryptResultBlob;
  emit('decrypted', res);
}

async function save() {
  const fileExt = await getBufferExt(decryptResultData.value);
  const fileName = `${path.parse(options.value.file.name).name || 'test'}${fileExt}`;
  downloadDecryptFile(decryptResultBlob.value, fileName);
}
</script>

<script>
export default {
  name: 'Decrypt',
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
