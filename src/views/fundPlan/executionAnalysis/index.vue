<script setup>
import {getCurrentInstance, reactive} from "vue";
import {useSelectData} from "@/hooks/useSelectData";
import {fundsPlanExecuteFlagexportAnalysis, FundsPlanExecuteFlagrunAnalysisQuery} from "@/api/fundPlan/executionMark";
import {requiredPageFilter} from "@/utils";
import {useUpload} from "@/hooks/useUpload";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'executionAnalysis'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: FundsPlanExecuteFlagrunAnalysisQuery,
  export: fundsPlanExecuteFlagexportAnalysis,
}

const {
  exportData,
} = useUpload(API)
const { selectorInfo, selectorRef } = useSelectData()
const filterInfo = reactive({
  query: {
    monthName: '',
    planChildItem: '',
    itemLevelBegin: '1',
    itemLevelEnd: '6',
    isShowChild: false,
    isShowLastLevelAndChild: false,
  },
  copyQuery: {},
  options: {
    levelList: [
      { key: '1', value: '1' },
      { key: '2', value: '2' },
      { key: '3', value: '3' },
      { key: '4', value: '4' },
      { key: '5', value: '5' },
      { key: '6', value: '6' },
      { key: '7', value: '7' },
      { key: '8', value: '8' },
    ],
  },
  list: [
    { label: '计划期间', value: 'monthName', showLabel: true, required: true, type: 'slot' },
    { label: '计划子项', value: 'planChildItem', type: 'input' },
    { type: 'slot', showLabel: true, label: '项目级次', value: 'itemLevelBegin' },
    { label: '仅显示末级项目和子项', value: 'isShowLastLevelAndChild', type: 'checkbox' },
    { label: '仅显示计划子项', value: 'isShowChild', type: 'checkbox' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList },
    { type: 'button', label: '重置', event: reset },
  ],
  btnList: [
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
        const required = requiredPageFilter(filterInfo.list, filterInfo.query)
        if(!required) return
        exportData({
          ...filterInfo.copyQuery,
          curPage: 1,
          pageSize: 9999,
        })
      }
    },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '编制期间', value: 'monthName' },
    { label: '计划项目编码', value: 'planItemCode' },
    { label: '计划项目名称', value: 'planItemName' },
    { label: '计划子项目', value: 'planChildItem' },
    { label: '项目属性', value: 'itemAttrName' },
    { label: '编制数', value: 'amount', align: 'right' },
    { label: '执行数', value: 'excuteAmount', align: 'right' },
    { label: '执行率(%)', value: 'excuteRate' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
})

function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return
  tableInfo.api = API.query
  filterInfo.copyQuery = {
    ...filterInfo.query,
    isShowChild: filterInfo.query.isShowChild ? '1' : '0',
    isShowLastLevelAndChild: filterInfo.query.isShowLastLevelAndChild ? '1' : '0',
  }
  tableInfo.refresh = Math.random()
}

function reset() {
  filterInfo.query = {}
  getList()
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
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
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
            <template #filter-itemLevelBegin>
              <el-select
                  style="width: 100px"
                  v-model="filterInfo.query.itemLevelBegin"
              >
                <el-option
                    v-for="(it) in filterInfo.options.levelList"
                    :key="it.key"
                    :label="it.value"
                    :value="it.value"
                />
              </el-select>
              -
              <el-select
                  style="width: 100px"
                  v-model="filterInfo.query.itemLevelEnd"
              >
                <el-option
                    v-for="(it) in filterInfo.options.levelList"
                    :key="it.key"
                    :label="it.value"
                    :value="it.value"
                />
              </el-select>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <TableContainer
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurPage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :tabIndex="true"
            rowKey="planItemName"
            :pager="false"
            :field-list="tableInfo.fieldList"
        >
        </TableContainer>
      </div>
    </div>
  <select-data ref="selectorRef" />
  </div>
</template>
