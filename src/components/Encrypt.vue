<template>
  <div>
    <el-upload
      :on-change="handleSelectFile"
      action=""
      :auto-upload="false"
    >
      <el-button type="primary" :loading="handling" :disabled="handling">
        加密文件
      </el-button>
    </el-upload>
    <el-button v-if="encryptResultBlob" type="primary" @click="save">
      保存文件
    </el-button>
  </div>
</template>

<script>
import path from 'node:path';
import { fileToArrayBuffer, enc } from '../utils/bin';
import { downloadEncryptFile } from '../utils/download';

export default {
  name: 'Encrypt',
  emits: ['encrypted'],
  data() {
    return {
      file: null,
      encryptResultBlob: null,
      handling: false,
    };
  },
  methods: {
    async handleSelectFile(file) {
      if (this.handling) return;
      this.handling = true;
      this.file = file;
      await this.encrypt(file);
      this.handling = false;
    },
    async encrypt(file) {
      this.encryptResultBlob = null;
      const curArrayBuffer = await fileToArrayBuffer(file.raw);
      this.encryptResultBlob = enc(curArrayBuffer);
      this.$emit('encrypted', this.encryptResultBlob);
    },
    save() {
      const fileName = `${path.parse(this.file.name).name || 'test'}.hctf`;
      downloadEncryptFile(this.encryptResultBlob, fileName);
    },
  },
};
</script>
