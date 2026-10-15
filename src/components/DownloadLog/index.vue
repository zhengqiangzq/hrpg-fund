<script setup>
import {computed, onMounted, reactive} from "vue";
import {deleteTaskInfo, pageTaskInfo} from "@/api/taskInfo";
import {ebankReceiptStatusQuery} from "@/api/directlyConnectBankAndHospital/ebankReceipt";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {useSelectData} from "@/hooks/useSelectData";

const emits = defineEmits(['update:visible'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  businessTypeCode: {
    type: String,
  },
  title: {
    type: String,
    default: '下载日志'
  }
})

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  options: {
    compareStatus: [
      { key: '正在进行', value: '2' },
      { key: '完成', value: '1' },
      { key: '失败', value: '0' },
    ],
  },
  list: [
    { label: '操作开始日期', value: 'createTimeEqAndGre', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '操作结束日期', value: 'createTimeEqAndLes', type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '任务号', value: 'taskNoLike', type: 'input' },
    { label: '状态', value: 'status', type: 'select', list: 'compareStatus' },
    { label: '操作人', value: 'createUserName', showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '删除', show: true, disabled: computed(() => !tableInfo.sectionRows.length), event: () => deleteData(), },
  ]
})
const tableInfo = reactive({
  refresh: 1,
  fieldList: [
    { label: '任务类型', value: 'businessTypeName' },
    { label: '任务号', value: 'taskNo' },
    { label: '状态', value: 'statusValue' },
    { label: '失败原因', value: 'failReason', width: '400px' },
    { label: '操作人', value: 'createUserName' },
    { label: '操作日期', value: 'createTime' },
  ],
  data: [],
  sectionRows: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: true,
        event: deleteData,
      },
      {
        label: '回单状态查询',
        show: true,
        event: receiptStatus,
        ifRender: (row) => {
          return row.status === '2' && row.receiptTaskInfo && props.businessTypeCode === 'bmp_receipt'
        }
      },
    ]
  }
})
const { selectorInfo, selectorRef } = useSelectData()

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emits('update:visible', newValue) // 更新父组件visible
  },
})

onMounted(() => {
  tableInfo.api = pageTaskInfo
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = {
    ...filterInfo.query,
    sort: 'create_time desc',
    businessTypeCode: props.businessTypeCode,
    createUserName: undefined
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  ElMessageBox.confirm('删除后无法恢复数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteTaskInfo(ids).then(({ code }) => {
      if (code === 200) {
        ElMessage.success({ message: '删除成功' })
        getList()
      }
    })
  })
}

function receiptStatus(row) {
  ebankReceiptStatusQuery(row.id).then(({ code }) => {
    if (code === 200) {
      ElMessage.success({ message: '查询成功' })
      getList()
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function openUserList() {
  selectorInfo.title = '操作人'
  selectorInfo.type = 'users'
  selectorInfo.query = {
    type: "normal",
    userType: '1',
    status: undefined,
  }
  selectorInfo.callback = (row) => {
    filterInfo.query["createUserName"] = row.name;
    filterInfo.query["createUser"] = row.id;
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" no-full-button flex v-model:visible="showDialog" :title="title">
    <div class="filter-wrapper">
      <NewPageFilter
          ref="filterRef"
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list"
          :filter-btn="filterInfo.filterbtn"
          :listTypeInfo="filterInfo.options"
      >
        <template #filter-createUserName>
          <el-input
              v-model="filterInfo.query.createUserName"
              style="width: 100%"
              type="input"
              placeholder="请选择操作人"
          >
            <template #append>
              <el-icon @click="openUserList"
              ><Search
              /></el-icon>
            </template>
          </el-input>
        </template>
      </NewPageFilter>
    </div>
    <div class="filter-wrapper">
      <!-- 条件栏 -->
      <NewPageFilter :filter-btn="filterInfo.btnList">
      </NewPageFilter>
    </div>
    <table-container
        :refresh="tableInfo.refresh"
        :init-curpage="tableInfo.initCurpage"
        v-model:data="tableInfo.data"
        :api="tableInfo.api"
        :query="filterInfo.copyQuery"
        :tabIndex="true"
        :field-list="tableInfo.fieldList"
        :handle="tableInfo.handle"
        @handleEvent="tableHandler"
    >
    </table-container>
    <select-data ref="selectorRef" />
  </ModifyPage>
</template>

<style scoped lang="scss">
.fullModel {
  position: unset !important;
}
</style>
