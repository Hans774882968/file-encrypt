<template>
  <el-upload
    :on-change="handleSelectFile"
    action=""
    :auto-upload="false"
  >
    <el-button type="primary">
      加密文件
    </el-button>
  </el-upload>
</template>

<script>
import { fileToArrayBuffer, enc } from '../utils/bin';
import { downloadFile } from '../utils/download';

export default {
  name: 'Encrypt',
  data() {
    return {
      curArrayBuffer: null,
    };
  },
  methods: {
    async handleSelectFile(file) {
      this.curArrayBuffer = await fileToArrayBuffer(file.raw);
      const encryptResultBlob = enc(this.curArrayBuffer);
      downloadFile(encryptResultBlob);
    },
  },
};
</script>
