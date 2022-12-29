<template>
  <div>
    <el-upload
      :on-change="handleSelectFile"
      action=""
      :auto-upload="false"
    >
      <el-button type="primary" :loading="handling" :disabled="handling">
        解密文件<el-icon class="el-icon--right"><Upload /></el-icon>
      </el-button>
    </el-upload>
    <el-button v-if="decryptResultBlob" type="primary" @click="save">
      保存文件<el-icon class="el-icon--right"><Download /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import path from 'node:path';
import { ElIcon, ElMessage } from 'element-plus';
import { Upload, Download } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { fileToArrayBuffer, getDecryptedU8Array } from '../utils/bin';
import { isLegalHCTFFile, getBufferExt } from '../utils/fileJudge';
import { downloadDecryptFile } from '../utils/download';

const emit = defineEmits(['decrypted']);

const file = ref(null);
const decryptResultData = ref(null);
const decryptResultBlob = ref(null);
const handling = ref(false);

async function handleSelectFile(_file) {
  if (handling.value) return;
  handling.value = true;
  file.value = _file;
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
  decryptResultData.value = getDecryptedU8Array(curArrayBuffer);
  decryptResultBlob.value = new Blob([decryptResultData.value]);
  emit('decrypted', decryptResultBlob.value);
}

async function save() {
  const fileExt = await getBufferExt(decryptResultData.value);
  const fileName = `${path.parse(file.value.name).name || 'test'}${fileExt}`;
  downloadDecryptFile(decryptResultBlob.value, fileName);
}
</script>

<script>
export default {
  name: 'Decrypt',
};
</script>
