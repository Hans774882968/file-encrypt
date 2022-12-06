<template>
  <div>
    <div class="hello">
      <encrypt />
      <decrypt @decrypted="getDecryptResult" />
    </div>
    <div class="viewers">
      <el-image
        v-if="decryptResultImg"
        class="img-view"
        :src="decryptResultImg"
        :preview-src-list="[decryptResultImg]"
      />
      <video-player
        v-if="decryptResultVideo"
        :video-data="decryptResultVideo"
      />
      <audio-player
        v-if="decryptResultAudio"
        :audio-data="decryptResultAudio"
      />
    </div>
  </div>
</template>

<script>
import Encrypt from './Encrypt.vue';
import Decrypt from './Decrypt.vue';
import VideoPlayer from './VideoPlayer.vue';
import AudioPlayer from './AudioPlayer.vue';
import {
  isPNG, isJPG, isMP4, isPDF, isMP3, isLegalHCTFFile,
} from '../utils/fileJudge';

export default {
  name: 'HelloWorld',
  components: {
    Encrypt,
    Decrypt,
    VideoPlayer,
    AudioPlayer,
  },
  data() {
    return {
      decryptResultImg: null,
      decryptResultVideo: null,
      decryptResultAudio: null,
    };
  },
  methods: {
    async getDecryptResult(decryptResultBlob) {
      const decryptResult = new Uint8Array(await decryptResultBlob.arrayBuffer());
      if (isPNG(decryptResult) || isJPG(decryptResult)) {
        this.decryptResultImg = URL.createObjectURL(decryptResultBlob);
      } else if (await isMP4(decryptResult)) {
        this.decryptResultVideo = URL.createObjectURL(decryptResultBlob);
      } else if (await isMP3(decryptResult)) {
        this.decryptResultAudio = URL.createObjectURL(decryptResultBlob);
      } else if (isLegalHCTFFile(decryptResult)) {
        this.$message.success('hctf文件');
      } else if (await isPDF(decryptResult)) {
        this.$message.success('pdf文件');
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
