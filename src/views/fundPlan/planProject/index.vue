<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch, computed} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import Modify from './modify.vue';
import Details from './details.vue';
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {requiredPageFilter} from "@/utils";
import {
  deletePlanProject,
  exportPlanProject,
  fundsPlanItemdisEnable,
  fundsPlanItemenable,
  pagePlanProject
} from "@/api/fundPlan/planProject";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'planProject'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pagePlanProject,
  delete: deletePlanProject,
  enable: fundsPlanItemenable,
  disable: fundsPlanItemdisEnable,
  export: exportPlanProject,
}

const {
  exportData,
} = useUpload(API, '计划项目导入模板', '/fundPlan/planProject/import', () => getList(), 'planProject:import')

const filterInfo = reactive({
  query: {
    code: '',
    name: '',
    itemAttr: '',
    enableStatus: '',
  },
  copyQuery: {},
  options: {
    projectAttributeList: [
      { key: '期初', value: '0' },
      { key: '收入', value: '1' },
      { key: '支出', value: '2' },
      { key: '期末', value: '3' },
      { key: '其他', value: '4' },
    ],
    enableStatusList: [
      { key: '已启用', value: '1' },
      { key: '已停用', value: '0' },
    ],
  },
  list: [
    { label: '计划项目编码', value: 'code', type: 'input' },
    { label: '计划项目名称', value: 'name', type: 'input' },
    { label: '项目属性', value: 'itemAttr', type: 'select', list: 'projectAttributeList' },
    { label: '启用状态', value: 'enableStatus', type: 'select-model', code: 'enabled_type' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:list`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => handleDelete(), disabled: true },
    { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => handleEnable(), disabled: true },
    { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:disable`), event: () => handleDisable(), disabled: true },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '计划项目编码', value: 'code', width: 150, type: 'slot' },
    { label: '计划项目名称', value: 'name', width: 200 },
    { label: '所属上级项目', value: 'parentName' },
    { label: '项目属性', value: 'itemAttrName' },
    { label: '取值方式', value: 'valueTypeName' },
    { label: '联动公式', value: 'valueFormula' },
    { label: '备注', value: 'remark' },
    { label: '启用状态', value: 'enableStatusName' },
    { label: '创建组织', value: 'orgName', width: 200 },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '250',
    btList: [
      {
        label: '详情',
        show: proxy.$permission(`${PERMISSION_CODE}:view`),
        event: handleDetail,
      },
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.enableStatus === '0',
      },
      {
        label: '启用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: handleEnable,
        ifRender: (row) => row.enableStatus === '0',
      },
      {
        label: '停用',
        show: proxy.$permission(`${PERMISSION_CODE}:disable`),
        event: handleDisable,
        ifRender: (row) => row.enableStatus === '1',
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: handleDelete,
        ifRender: (row) => row.enableStatus === '0',
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '计划项目',
  visible: false
})
const detailsInfo = reactive({
  visible: false,
  title: '计划项目详情',
  id: null,
  enableStatus: null,
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const del = filterInfo.btnList.find(it => it.label === '删除')
  const enable = filterInfo.btnList.find(it => it.label === '启用')
  const disable = filterInfo.btnList.find(it => it.label === '停用')
  const use = rows.filter(it => it.enableStatus === '1')
  const dis = rows.filter(it => it.enableStatus === '0')
  del.disabled = !rows.length || use.length > 0
  enable.disabled = !rows.length || use.length > 0
  disable.disabled = !rows.length || dis.length > 0

}, { immediate: true })

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
  })
  tableInfo.refresh = Math.random()
}

function reset() {
  filterInfo.query = {
    code: '',
    name: '',
    itemAttr: '',
    enableStatus: '',
  }
  getList()
}

function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改计划项目' : '新增计划项目'
  modifyInfo.visible = true
}

function handleDetail(row) {
  detailsInfo.id = row.id
  detailsInfo.enableStatus = row.enableStatus
  detailsInfo.visible = true
}

function handleDelete(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择要删除的数据')
  }
  const message = ids.length === 1 ? '删除后将改变数据，是否继续？' : `确认删除选中的 ${ids.length} 条数据？`
  proxy
      .$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        API.delete(ids).then(res => {
          proxy.$message.success('删除成功')
          getList()
        })
      })
      .catch(() => {})
}

function handleEnable(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择要启用的数据')
  }
  const message = ids.length === 1 ? '确认启用该数据？' : `确认启用选中的 ${ids.length} 条数据？`
  proxy
      .$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        API.enable(ids).then(res => {
          proxy.$message.success('启用成功')
          getList()
        })
      })
      .catch(() => {})
}

function handleDisable(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择要停用的数据')
  }
  const message = ids.length === 1 ? '确认停用该数据？' : `确认停用选中的 ${ids.length} 条数据？`
  proxy
      .$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        API.disable(ids).then(res => {
          proxy.$message.success('停用成功')
          getList()
        })

      })
      .catch(() => {})
}

const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailsInfo.visible">
        <div class="layui-card-body">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :listTypeInfo="filterInfo.options"
                :filter-btn="filterInfo.filterbtn"
            >
            </NewPageFilter>
          </div>
          <div class="filter-wrapper">
            <NewPageFilter :filter-btn="filterInfo.btnList">
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :query="filterInfo.copyQuery"
              :summary="!!tableInfo.summaryFieldList?.length"
              :summaryFieldList="tableInfo.summaryFieldList"
              :tabIndex="true"
              :pager="false"
              className="whitePreWrap"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
            <template #col-code="{ row }">
              <span class="slip-edit" @click="handleDetail(row)">{{ row.code }}</span>
            </template>
          </table-container>
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
          :enableStatus="detailsInfo.enableStatus"
          v-model:visible="detailsInfo.visible"
          @returnBack="getList"
      ></Details>
      <select-data ref="selectorRef" />
    </div>
  </div>
</template>
