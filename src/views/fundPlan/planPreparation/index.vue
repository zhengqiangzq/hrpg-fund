<script setup>
import {getCurrentInstance, reactive, onMounted, ref} from "vue";
import Modify from './modify.vue'
import DetailList from './detailList.vue'
import Details from './details.vue'
import {useSelectData} from "@/hooks/useSelectData";
import {
  fundsPlanPreparedelete, fundsPlanPrepareexport,
  fundsPlanPreparePage,
  fundsPlanPreparesure,
  fundsPlanPrepareunSure
} from "@/api/fundPlan/planPreparation";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'planPreparation'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: fundsPlanPreparePage,
  delete: fundsPlanPreparedelete,
  confirm: fundsPlanPreparesure,
  cancelConfirm: fundsPlanPrepareunSure,
  export: fundsPlanPrepareexport,
}
const {
  exportData,
} = useUpload(API)

const { selectorInfo, selectorRef } = useSelectData()
const filterInfo = reactive({
  query: {
    monthName: '',
    status: '',
  },
  copyQuery: {},
  options: {
    compareStatus: [
      { key: '已确认', value: '1' },
      { key: '未确认', value: '0' },
    ],
  },
  list: [
    { label: '计划期间', value: 'monthName', showLabel: true, type: 'slot' },
    { label: '确认状态', value: 'status', type: 'select', list: 'compareStatus' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify() },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), disabled: true },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: confirmData, disabled: true },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:unconfirm`), event: cancelConfirmData, disabled: true },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery) },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '编制组织', value: 'orgName' },
    { label: '计划期间', value: 'monthName', type: 'slot' },
    { label: '备注', value: 'remark' },
    { label: '确认状态', value: 'statusName' },
    { label: '编制人', value: 'createUserName' },
    { label: '编制日期', value: 'createTime' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})

watch(() => tableInfo.sectionRows, (rows) => {
  const del = filterInfo.btnList.find(it => it.label === '删除')
  const confirm = filterInfo.btnList.find(it => it.label === '确认')
  const unconfirm = filterInfo.btnList.find(it => it.label === '取消确认')
  const use = rows.filter(it => it.status === '1')
  const dis = rows.filter(it => it.status === '0')
  del.disabled = !rows.length || use.length > 0
  confirm.disabled = !rows.length || use.length > 0
  unconfirm.disabled = !rows.length || dis.length > 0

}, { immediate: true })

const modifyInfo = reactive({
  id: null,
  title: '计划编制',
  visible: false
})
const detailsInfo = reactive({
  visible: false,
  title: '计划编制详情',
  id: null
})
const detailListInfo = reactive({
  visible: false
})
onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function getList() {
  filterInfo.copyQuery = {
    ...filterInfo.query,
    monthName: null
  }
  tableInfo.refresh = Math.random()
}

function reset() {
  filterInfo.query = {
    monthName: '',
    status: '',
  }
  getList()
}

function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改计划编制' : '新增计划编制'
  modifyInfo.visible = true
}

function handleDetail(row) {
  detailsInfo.id = row.id
  detailsInfo.visible = true
}

function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要删除的数据')
    return
  }
  proxy
      .$confirm(ids.length > 1 ? `确定删除选中的${ids.length}条数据？` : '确定删除选中的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function confirmData() {
  const ids = tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要确认的数据')
    return
  }
  proxy
      .$confirm(`确定确认选中的${ids.length}条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.confirm(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('确认成功')
        getList()
      }
    })
  })
}

function cancelConfirmData() {
  const ids = tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    proxy.$message.warning('请选择要取消确认的数据')
    return
  }
  proxy
      .$confirm(`确定取消确认选中的${ids.length}条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.cancelConfirm(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('取消确认成功')
        getList()
      }
    })
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectPlanPeriod() {
  selectorInfo.type = 'accountingPeriodMonth'
  selectorInfo.callback = (data) => {
    filterInfo.query.monthId = data.id
    filterInfo.query.monthName = data.periodYearAndMonth
  }
  selectorInfo.visible = true
}

</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailListInfo.visible && !detailsInfo.visible">
        <div class="layui-card-body">
          <div class="titleTab">
            <div class="tab currentTab">列表页</div>
            <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
          </div>
          <div>
            <div class="filter-wrapper">
              <NewPageFilter
                  v-model:query="filterInfo.query"
                  :filter-list="filterInfo.list"
                  :listTypeInfo="filterInfo.options"
                  :filter-btn="filterInfo.filterbtn"
              >
                <template #filter-monthName>
                  <el-input
                      v-model="filterInfo.query.monthName"
                      style="width: 100%"
                      class="not-mongolia"
                      type="input"
                      :disabled="true"
                      placeholder="请选择计划期间"
                  >
                    <template #append>
                      <el-icon @click="selectPlanPeriod"><Search /></el-icon>
                    </template>
                  </el-input>
                </template>
              </NewPageFilter>
            </div>
            <div class="filter-wrapper">
              <NewPageFilter :filter-btn="filterInfo.btnList">
              </NewPageFilter>
            </div>
          </div>
          <TableContainer
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurPage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :query="filterInfo.copyQuery"
              :tabIndex="true"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
            <template #col-monthName="{ row }">
              <span class="slip-edit" @click="handleDetail(row)">{{ row.monthName }}</span>
            </template>
          </TableContainer>
        </div>
      </div>
      <Modify
          v-if="modifyInfo.visible"
          v-model:visible="modifyInfo.visible"
          :id="modifyInfo.id"
          :title="modifyInfo.title"
          @returnModify="getList"
      />
      <Details
          v-if="detailsInfo.visible"
          :title="detailsInfo.title"
          :id="detailsInfo.id"
          v-model:visible="detailsInfo.visible"
          @returnBack="getList"
      ></Details>
      <DetailList
          v-if="detailListInfo.visible"
          v-model:visible="detailListInfo.visible"
          @callback="getList"
      ></DetailList>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>
