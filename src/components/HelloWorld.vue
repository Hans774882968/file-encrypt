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
        :preview-src-list="imgPreviewSrcList"
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

<script setup>
import { fileTypeFromBuffer } from 'file-type';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import Encrypt from './Encrypt.vue';
import Decrypt from './Decrypt.vue';
import VideoPlayer from './VideoPlayer.vue';
import AudioPlayer from './AudioPlayer.vue';
import {
  isPNG, isJPG, isPDF, isMP3, isLegalHCTFFile, isVideo, isExcel, isGif, isWebp,
} from '../utils/fileJudge';

const decryptResultImg = ref(null);
const decryptResultVideo = ref(null);
const decryptResultAudio = ref(null);

const imgPreviewSrcList = computed(() => [decryptResultImg.value]);

function clearDecryptResult() {
  decryptResultImg.value = null;
  decryptResultVideo.value = null;
  decryptResultAudio.value = null;
}

async function getDecryptResult(decryptResultObject) {
  clearDecryptResult();
  const { decryptResultData: decryptResult, decryptResultBlob } = decryptResultObject;
  const fileTypeResult = await fileTypeFromBuffer(decryptResult);
  if (isPNG(decryptResult) || isJPG(decryptResult)
    || await isGif(fileTypeResult) || await isWebp(fileTypeResult)) {
    decryptResultImg.value = URL.createObjectURL(decryptResultBlob);
  } else if (await isVideo(fileTypeResult)) {
    decryptResultVideo.value = URL.createObjectURL(decryptResultBlob);
  } else if (await isMP3(fileTypeResult)) {
    decryptResultAudio.value = URL.createObjectURL(decryptResultBlob);
  } else if (isLegalHCTFFile(decryptResult)) {
    ElMessage.success('hctf文件，请继续解密');
  } else if (await isPDF(fileTypeResult)) {
    ElMessage.success('pdf文件');
  } else if (await isExcel(fileTypeResult)) {
    ElMessage.success('Excel文件');
  } else {
    ElMessage.warning('未知的文件类型');
  }
}
</script>

<script>
export default {
  name: 'HelloWorld',
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
:deep(.el-image__placeholder) {
  background: url('../assets/icon-loading.svg') no-repeat 50% 50%;
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
}
:deep(.el-image__wrapper) {
  background-color: white;
}
</style>
