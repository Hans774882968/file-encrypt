<template>
  <el-upload
    :on-change="handleSelectFile"
    action=""
    :auto-upload="false"
  >
    <el-button type="primary">
      解密文件
    </el-button>
  </el-upload>
</template>

<script>
import { fileToArrayBuffer, dec } from '../utils/bin';
import { isLegalHCTFFile } from '../utils/fileJudge';

export default {
  name: 'Decrypt',
  emits: ['decrypted'],
  data() {
    return {
      curArrayBuffer: null,
    };
  },
  methods: {
    async handleSelectFile(file) {
      this.curArrayBuffer = await fileToArrayBuffer(file.raw);
      if (!isLegalHCTFFile(this.curArrayBuffer)) {
        this.$message.error('不是合法的 .hctf 文件！');
        return;
      }
      const decryptResultBlob = dec(this.curArrayBuffer);
      this.$emit('decrypted', decryptResultBlob);
    },
  },
};
</script>
