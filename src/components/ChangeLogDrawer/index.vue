<script setup>
import {onMounted, ref, watch} from "vue";
import request from '@/utils/request'

const props = defineProps({
  id: null
})
const emits = defineEmits(['close'])

const logs = ref()
const MAPPER = {
  main: '基础信息',
  detail: '详细信息',
  budget: '预算信息',
  pay: '支付信息',
  borrow: '借款冲销',
  invoice: '发票信息',
  write_off_advance: '预付款冲销'
}

const drawerVisible = ref(false)

watch(() => drawerVisible.value, (flag) => {
  if (!flag) {
    emits('close')
  }
})

onMounted(() => {
  getList()
})

function getList() {
  request({
    url: '/orderModifyRecords/getByOrderId',
    method: 'get',
    params: {
      orderId: props.id
    }
  }).then(res => {
    if (res.success) {
      drawerVisible.value = true
      logs.value = res.data
    }
  })
}
</script>

<template>
  <el-drawer title="修改记录" v-model="drawerVisible" size="60%">
    <template v-if="logs?.length === 0">
      <el-empty description="没有修改记录" />
    </template>
    <el-timeline v-else direction="vertical">
      <el-timeline-item v-for="(log, index) in logs" :key="index" :timestamp="`${log.time} ${log.createUserName || ''}`" placement="top">
        <el-card body-style="padding: 0">
          <el-collapse :model-value="log.content.map(it => it.modifyItem)">
            <el-collapse-item :name="content.modifyItem" v-for="(content, cIndex) in log.content" :key="cIndex">
              <template #title>
                <el-text style="margin-left: 20px;" type="primary">{{ MAPPER[content.modifyItem] }}</el-text>
              </template>
              <div style="padding: 0 30px;">
                <el-descriptions size="small" title="修改前" :column="1">
                  <el-descriptions-item :label="content.modifyItem !== 'main' ? i + 1 : undefined" v-for="(c, i) in JSON.parse(content.oldContent)" :key="i">{{ c }}</el-descriptions-item>
                </el-descriptions>
                <el-descriptions size="small" title="修改后" :column="1">
                  <el-descriptions-item :label="content.modifyItem !== 'main' ? i + 1 : undefined" v-for="(c, i) in JSON.parse(content.newContent)" :key="i">{{ c }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-drawer>
</template>

<style scoped lang="scss">

</style>