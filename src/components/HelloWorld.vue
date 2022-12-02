<template>
  <div>
    <div class="hello">
      <encrypt />
      <decrypt @decrypted="getDecryptResult" />
    </div>
    <div class="viewers">
      <el-image
        class="img-view"
        v-if="decryptResultImg"
        :src="decryptResultImg"
        :preview-src-list="[decryptResultImg]">
      </el-image>
      <player v-if="decryptResultVideo" :videoData="decryptResultVideo" />
    </div>
  </div>
</template>

<script>
import Encrypt from './Encrypt.vue';
import Decrypt from './Decrypt.vue';
import Player from './Player.vue';
import { isPNG, isJPG, isMP4 } from '../utils/fileJudge';

export default {
  name: 'HelloWorld',
  components: {
    Encrypt,
    Decrypt,
    Player,
  },
  data() {
    return {
      decryptResultImg: null,
      decryptResultVideo: null,
    };
  },
  methods: {
    async getDecryptResult(decryptResultBlob) {
      const decryptResult = new Uint8Array(await decryptResultBlob.arrayBuffer());
      if (isPNG(decryptResult) || isJPG(decryptResult)) {
        this.decryptResultImg = URL.createObjectURL(decryptResultBlob);
      } else if (isMP4(decryptResult)) {
        this.decryptResultVideo = URL.createObjectURL(decryptResultBlob);
      } else {
        this.$message({
          message: '未知的文件类型',
          type: 'warning',
        });
      }
    },
  },
};
</script>

<style scoped>
.hello {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.hello * {
  flex: 1;
}
.img-view {
  width: 600px;
  height: 600px;
}
.viewers {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
