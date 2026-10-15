<template>
  <p>
    {{ text
    }}<el-tooltip placement="top" effect="light">
      <template #content><span v-html="tips"></span> </template>
      <el-icon><QuestionFilled /></el-icon
    ></el-tooltip>
    <span class="sum-item" v-for="item in sums" :key="item">{{ item }}</span>
  </p>
</template>
<script setup name="Tooltip">
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  tips: {
    type: String,
    default: "将鼠标移到表格上，按住shift+鼠标滚轮滚动可以实现表格左右滑动",
  },
  sums: {
    type: Array,
    default: function () {
      return [];
    },
  },
});
</script>
<style lang="scss" scoped>
.sum-item {
  padding-left: 10px;
  font-weight: normal;
  color: #606266;
}
</style>
