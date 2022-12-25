<template>
  <el-form ref="form" :model="options" label-width="200px">
    <el-form-item label="使用自定义密钥">
      <el-checkbox v-model="options.useCustomKey">
        使用自定义密钥
      </el-checkbox>
    </el-form-item>
    <el-form-item v-if="options.useCustomKey" label="输入自定义密钥">
      <div class="custom-key">
        <el-input
          v-model="options.key"
          placeholder="Please input"
          :autosize="customKeyAutoSize"
          type="textarea"
        />
        <el-tooltip
          class="item"
          effect="dark"
          content="1. 非ASCII字符使用UTF-8编码。2. 若勾选“使用自定义密钥”但不输入密钥，则仍使用默认密钥。"
          placement="right"
        >
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

<script>
import path from 'node:path';
import { Upload, Download, QuestionFilled } from '@element-plus/icons-vue';
import { fileToArrayBuffer, enc } from '../utils/bin';
import { downloadEncryptFile } from '../utils/download';

export default {
  name: 'Encrypt',
  components: {
    Upload,
    Download,
    QuestionFilled,
  },
  emits: ['encrypted'],
  data() {
    return {
      encryptResultBlob: null,
      handling: false,
      options: {
        file: null,
        useCustomKey: false,
        key: '',
      },
    };
  },
  computed: {
    encryptKey() {
      return this.options.useCustomKey ? this.options.key : '';
    },
    keyLength() {
      return new TextEncoder().encode(this.options.key).length;
    },
    customKeyAutoSize() {
      return { minRows: 3, maxRows: 10 };
    },
  },
  methods: {
    async handleSelectFile(file) {
      if (this.handling) return;
      this.handling = true;
      this.options.file = file;
      await this.encrypt(file);
      this.handling = false;
    },
    async encrypt(file) {
      this.encryptResultBlob = null;
      const curArrayBuffer = await fileToArrayBuffer(file.raw);
      this.encryptResultBlob = enc(curArrayBuffer, this.encryptKey);
      this.$emit('encrypted', this.encryptResultBlob);
    },
    save() {
      const fileName = `${path.parse(this.options.file.name).name || 'test'}.hctf`;
      downloadEncryptFile(this.encryptResultBlob, fileName);
    },
  },
};
</script>

<style lang="less" scoped>
.custom-key {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
