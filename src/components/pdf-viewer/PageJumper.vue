<template>
  <div class="jumper-container">
    <span>前往</span>
    <el-input-number
      v-model="currentInputPageNumber"
      class="jumper-input"
      :controls="false"
      :min="1"
      :max="pageCount"
      :step="1"
      :precision="0"
      @keyup.enter="changeCurrentPage"
    />
    <span>页</span>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { toRefs, ref } from 'vue';

const emit = defineEmits(['changePage']);

const props = defineProps({
  pageCount: {
    type: Number,
    required: true,
  },
});
const { pageCount } = toRefs(props);

const currentInputPageNumber = ref(1);

function changeCurrentPage() {
  if (!currentInputPageNumber.value || Number.isNaN(currentInputPageNumber.value)) {
    ElMessage.warning('请输入合法的页码');
    return;
  }
  emit('changePage', currentInputPageNumber.value);
}
</script>

<style lang="less" scoped>

.jumper-container {
  font-size: 18px;

  .jumper-input {
    margin: 0 24px;
  }
}
</style>
