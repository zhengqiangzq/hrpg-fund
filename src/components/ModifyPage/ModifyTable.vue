<script setup>
import {computed, inject, onMounted, onUnmounted, ref, watch} from "vue";

const on = inject('on')
const off = inject('off')

const emits = defineEmits(['handleEvent'])

const props = defineProps({
  noTitle: {
    type: Boolean,
    default: false
  },
  tableInfo: {
    type: Object,
    required: true
  },
  pager: {
    type: Boolean,
    default: false
  },
  isDynamic: {
    type: Boolean,
    default: false
  },
  checkbox: {
    type: Boolean,
    default: true
  }
})

const tableForm = ref()
const tableRef = ref()

const queryComputed = computed(() => {
  return props.tableInfo.copyQuery || props.tableInfo.query
})

const validate = () => {
  return new Promise((resolve, reject) => {
    tableForm.value.validate((valid, data) => {
      if (!valid) {
        reject(data)
      }
      resolve(true)
    })
  })
}

function handleEvent(...args) {
  emits('handleEvent', ...args)
}

onMounted(() => {
  on('validate', validate)
  props.tableInfo.tableRef = tableRef.value
})
onUnmounted(() => off('validate', validate))
</script>

<template>
  <div class="model-panel">
    <div class="model-panel-title" v-if="!noTitle">
      <Tooltip :text="tableInfo.title ?? '明细信息'" />
    </div>
    <div class="model-panel-body">
      <!-- 条件栏 -->
      <PageFilter
          :isAddFlag="true"
          v-model:query="tableInfo.query"
          :filter-list="tableInfo.btnList"
      >
        <template
            v-for="(slotKey, index) in Object.keys($slots).filter(key => /^filter-.+/.test(key))"
            #[slotKey]="scope"
            :key="index">
          <slot :name="slotKey" v-bind="scope" />
        </template>
      </PageFilter>
      <div class="flex_full_item">
        <el-form
            ref="tableForm"
            :model="tableInfo"
            style="width: 100%">
          <!-- 表格 -->
          <page-table
              ref="tableRef"
              :refresh="tableInfo.refresh || Math.random()"
              :init-curpage="tableInfo.initCurpage ?? 1"
              v-model:data="tableInfo.data"
              :pager="pager"
              :api="tableInfo.api"
              :summary="!!tableInfo.summaryFieldList?.length"
              :summaryFieldList="tableInfo.summaryFieldList"
              :tabIndex="true"
              :check-box="checkbox"
              :highlight-row="tableInfo.highlightRow"
              :query="queryComputed"
              :rowClassName="tableInfo.rowClassName"
              :field-list="tableInfo.fieldList"
              :isDynamic="isDynamic"
              :handle="tableInfo.handle"
              @handleEvent="handleEvent"
          >
            <template
                v-for="(slotKey, index) in Object.keys($slots).filter(key => /^col-.+/.test(key))"
                #[slotKey]="scope"
                :key="index">
              <slot :name="slotKey" v-bind="scope" />
            </template>
          </page-table>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.model-panel {
  flex: 1;
  height: 100%;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  .model-panel-body {
    flex: 1;
  }
}
</style>
