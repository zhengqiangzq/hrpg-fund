<template>
  <el-drawer
    v-model="shows"
    title="操作流水"
    :size="'22%'"
    @close="emits('callBack')"
  >
    <div class="operateAffair">
      <el-empty v-if="!list.length" description="暂无数据" />
      <el-timeline v-else :reverse="reverse">
        <el-timeline-item
          v-for="(item, index) in list"
          :key="index"
          color="#409eff"
          placement="bottom"
          :timestamp="item.operateTime"
        >
          <h3 class="operateAffair-h3">
            {{ item.operateTypeValue || '-' }}
          </h3>
          <div v-if="item.orderTypeValue" class="operateAffair-p">
            单据类型：{{ item.orderTypeValue || '-' }}
          </div>
          <div class="operateAffair-p">
            操作组织：{{ item.orgName || '-' }}
          </div>
          <div class="operateAffair-p">
            操作部门：{{ item.operateDeptName || '-' }}
          </div>
          <div class="operateAffair-p">
            操作人：{{ item.operateUserName || '-' }}
          </div>
          <div class="operateAffair-p">备注：{{ item.remark || '-' }}</div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-drawer>
</template>

<script setup name="OperateAffair">
import { orderOpAffairAll } from '@/api/affair'

const props = defineProps({
  //指定节点排序方向
  reverse: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  info: {
    type: Object,
    default: function () {
      return {}
    },
  },
})
const emits = defineEmits(['update:visible', 'callBack'])
const list = ref([])
const shows = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件shows
  },
})
watch(
  () => props.visible,
  (val) => {
    if (val) {
      getOperateAffairList()
    }
  },
  { deep: true, immediate: true }
)

function getOperateAffairList() {
  let api = props.info.api || orderOpAffairAll
  api(props.info.query).then((res) => {
    if (res && res.success) {
      list.value = res.data
    }
  })
}
</script>

<style scoped lang="scss">
.operateAffair {
  // display: inline-block;

  // text-align: center;
  margin-left: 18%;
  margin-right: 18%;
  height: 100%;
  width: 67%;
  .operateAffair-h3 {
    font-weight: 800;
    color: #409eff;
    font-size: 14px;
  }
  .operateAffair-p {
    font-weight: 400;
    color: #a4a3a0;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
