<template>
  <div class="app-page">
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
      <text-viewer
        v-if="decryptResultMayBeText"
        :text-data="decryptResultMayBeText"
      />
      <pdf-viewer
        v-if="decryptResultPDFData"
        :pdf-data="decryptResultPDFData"
        :width="1600"
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
import TextViewer from './TextViewer.vue';
import PdfViewer from './pdf-viewer/PDFViewer.vue';
import {
  isPNG, isJPG, isPDF, isMP3, isLegalHCTFFile, isVideo, isExcel, isGif, isWebp, mayBeMeaningfulText,
} from '../utils/fileJudge';
import { getLineMaxLength } from '../utils/utils';

const decryptResultImg = ref(null);
const decryptResultVideo = ref(null);
const decryptResultAudio = ref(null);
const decryptResultMayBeText = ref(null);
const decryptResultPDFData = ref(null);

const imgPreviewSrcList = computed(() => [decryptResultImg.value]);

function clearDecryptResult() {
  decryptResultImg.value = null;
  decryptResultVideo.value = null;
  decryptResultAudio.value = null;
  decryptResultMayBeText.value = null;
  decryptResultPDFData.value = null;
}

const LINE_MAX_LEN_LIMIT = 100000;
// 这个函数改写为计算属性会有未知bug，在重新渲染时报错
function textViewerShouldRender() {
  if (!decryptResultMayBeText.value) {
    ElMessage.success('检测到空文档');
  }
  const lineMaxLen = getLineMaxLength(decryptResultMayBeText.value);
  if (lineMaxLen > LINE_MAX_LEN_LIMIT) {
    ElMessage.success(`该文档单行长度过大（${lineMaxLen} / ${LINE_MAX_LEN_LIMIT}），为防止页面崩溃，暂不提供预览功能`);
    decryptResultMayBeText.value = '';
  }
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
    ElMessage.success('识别结果：hctf文件，请在保存文件后继续解密');
  } else if (await isPDF(fileTypeResult)) {
    ElMessage.success('识别结果：pdf文件');
    decryptResultPDFData.value = URL.createObjectURL(decryptResultBlob);
  } else if (await isExcel(fileTypeResult)) {
    ElMessage.success('识别结果：Excel文件');
  } else if (mayBeMeaningfulText(decryptResult)) {
    decryptResultMayBeText.value = new TextDecoder().decode(decryptResult);
    textViewerShouldRender();
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
.app-page {
  padding: 20px;

  .hello {
    display: flex;
    gap: 20px;
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
