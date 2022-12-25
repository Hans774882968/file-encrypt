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
import { fileTypeFromBuffer } from 'file-type';
import Encrypt from './Encrypt.vue';
import Decrypt from './Decrypt.vue';
import VideoPlayer from './VideoPlayer.vue';
import AudioPlayer from './AudioPlayer.vue';
import {
  isPNG, isJPG, isPDF, isMP3, isLegalHCTFFile, isVideo, isExcel,
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
    clearDecryptResult() {
      this.decryptResultImg = null;
      this.decryptResultVideo = null;
      this.decryptResultAudio = null;
    },
    async getDecryptResult(decryptResultBlob) {
      this.clearDecryptResult();
      const decryptResult = new Uint8Array(await decryptResultBlob.arrayBuffer());
      const fileTypeResult = await fileTypeFromBuffer(decryptResult);
      if (isPNG(decryptResult) || isJPG(decryptResult)) {
        this.decryptResultImg = URL.createObjectURL(decryptResultBlob);
      } else if (await isVideo(fileTypeResult)) {
        this.decryptResultVideo = URL.createObjectURL(decryptResultBlob);
      } else if (await isMP3(fileTypeResult)) {
        this.decryptResultAudio = URL.createObjectURL(decryptResultBlob);
      } else if (isLegalHCTFFile(decryptResult)) {
        this.$message.success('hctf文件，请继续解密');
      } else if (await isPDF(fileTypeResult)) {
        this.$message.success('pdf文件');
      } else if (await isExcel(fileTypeResult)) {
        this.$message.success('Excel文件');
      } else {
        this.$message.warning('未知的文件类型');
      }
    },
  },
};
</script>

<style lang="less" scoped>
.hello {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.hello > * {
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
