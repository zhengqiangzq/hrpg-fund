<script setup>
import {computed, getCurrentInstance, reactive, onMounted} from "vue";
import {useSelectData} from "@/hooks/useSelectData";
import {fundsPlanPrepareDetailPage} from "@/api/fundPlan/planPreparation";
import {FundsPlanExecuteFlagexecuteFlag} from "@/api/fundPlan/executionMark";

const { proxy } = getCurrentInstance();
const emit = defineEmits(['callback'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '执行标记',
  },
  rows: {
    type: Array,
    default: () => [],
  },
  params: {
    type: Object,
    default: () => {},
  },
})

const API = {
  query: fundsPlanPrepareDetailPage,
  executionMark: FundsPlanExecuteFlagexecuteFlag,
}

const { selectorInfo, selectorRef } = useSelectData()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  options: {
    incomeType: [
      { key: '收款', value: '1' },
      { key: '付款', value: '2' },
    ],
  },
  list: [
    { label: '收付类型', value: 'itemAttr', type: 'select', list: 'incomeType', disabled: true },
    { label: '计划项目', value: 'planItemName', showLabel: true, type: 'slot' },
    { label: '计划子项', value: 'planChildItem', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
})

const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  currentRow: {},
  fieldList: [
    { label: '计划项目编码', value: 'planItemCode' },
    { label: '计划项目名称', value: 'planItemName' },
    { label: '计划子项', value: 'planChildItem' },
  ],
  data: [],
})
onMounted(() => {
  filterInfo.query = {
    itemAttr: props.params.type,
    monthId: props.params.monthId,
  }
  getList()
})

function getList() {
  tableInfo.api = API.query
  filterInfo.copyQuery = {
    ...filterInfo.query,
  }
  tableInfo.refresh = Math.random()
}
function reset() {
  filterInfo.query = {
    itemAttr: props.params.type,
    monthId: props.params.monthId,
  }
  getList()
}

function confirm() {
  if (!tableInfo.currentRow.id) {
    proxy.$message.warning('请选择要标记的计划子项')
    return
  }
  const ids = props.rows.map(it => it.orderDetailId)
  API.executionMark({
    planPrepareDetailId: tableInfo.currentRow.id,
    businessIds: ids,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('执行标记成功')
      showDialog.value = false
      emit('callback', true)
    }
  })
}

function tableHandler(eventName, raw) {
  tableInfo.currentRow = raw;
}

function cancel() {
  showDialog.value = false
  emit('callback', false)
}
function selectParentProject() {
  selectorInfo.type = 'planProject'
  selectorInfo.className = 'whitePreWrap'
  selectorInfo.query = {
    enableStatus: '1'
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.planItemId = data.id || '-2'
    filterInfo.query.planItemName = data.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <el-dialog
      :title="title"
      v-model="showDialog"
      width="1000px"
      :close-on-click-modal="false"
      @close="cancel"
  >
    <div class="filter-wrapper" style="margin-bottom: 15px">
      <NewPageFilter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list"
          :listTypeInfo="filterInfo.options"
          :filter-btn="filterInfo.filterbtn"
      >
        <template #filter-planItemName>
          <el-input
              v-model="filterInfo.query.planItemName"
              style="width: 100%"
              class="not-mongolia"
              type="input"
              :disabled="true"
              placeholder="请选择计划项目"
          >
            <template #append>
              <el-icon @click="selectParentProject"><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </NewPageFilter>
    </div>
    <TableContainer
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurPage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :query="filterInfo.copyQuery"
        :tabIndex="true"
        :pager="true"
        :highlightRow="true"
        :isDynamic="false"
        :field-list="tableInfo.fieldList"
        :checkBox="false"
        @handleEvent="tableHandler"
    >
    </TableContainer>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </span>
    </template>
    <select-data ref="selectorRef" />
  </el-dialog>
</template>
