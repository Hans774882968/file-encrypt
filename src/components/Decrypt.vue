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

<script>
import path from 'node:path';
import { ElIcon } from 'element-plus';
import { Upload, Download } from '@element-plus/icons-vue';
import { fileToArrayBuffer, getDecryptedU8Array } from '../utils/bin';
import { isLegalHCTFFile, getBufferExt } from '../utils/fileJudge';
import { downloadDecryptFile } from '../utils/download';

export default {
  name: 'Decrypt',
  components: {
    ElIcon,
    Upload,
    Download,
  },
  emits: ['decrypted'],
  data() {
    return {
      file: null,
      decryptResultData: null,
      decryptResultBlob: null,
      handling: false,
    };
  },
  methods: {
    async handleSelectFile(file) {
      if (this.handling) return;
      this.handling = true;
      this.file = file;
      await this.decrypt(file);
      this.handling = false;
    },
    async decrypt(file) {
      this.decryptResultBlob = null;
      const curArrayBuffer = await fileToArrayBuffer(file.raw);
      if (!isLegalHCTFFile(curArrayBuffer)) {
        this.$message.error('不是合法的 .hctf 文件！');
        return;
      }
      this.decryptResultData = getDecryptedU8Array(curArrayBuffer);
      this.decryptResultBlob = new Blob([this.decryptResultData]);
      this.$emit('decrypted', this.decryptResultBlob);
    },
    async save() {
      const fileExt = await getBufferExt(this.decryptResultData);
      const fileName = `${path.parse(this.file.name).name || 'test'}${fileExt}`;
      downloadDecryptFile(this.decryptResultBlob, fileName);
    },
  },
};
</script>
