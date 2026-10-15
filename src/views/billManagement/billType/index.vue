<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {
  addBillType,
  allBillType,
  deleteBillType, disableBillType, enableBillType,
  oneBillType,
  chequetypeexcel,
  updateBillType
} from "@/api/billManagement/billType";
import AddEdit from './AddEdit.vue'
import {useUpload} from "@/hooks/useUpload";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {exportTemplateExcel} from "@/api/pub";

const PERMISSION_CODE = 'billType'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()

const API = {
  list: allBillType,
  add: addBillType,
  update: updateBillType,
  del: deleteBillType,
  detail: oneBillType,
  enable: enableBillType,
  deactivate: disableBillType,
  export: chequetypeexcel,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'fundsChequeTypeImportTemplate', '/business/paymentOrder/import/excel', () => getList(), 'billType:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14004',
  action: '/cheque/type/import/excelRecord'
})

const menuButton = reactive([
  {
    type: 'button',
    label: '新增',
    disabled: false,
    event: addNewData,
    show: proxy.$permission(`${PERMISSION_CODE}:add`),
  },
  {
    type: 'button',
    label: '删除',
    disabled: true,
    event: deleteClick,
    show: proxy.$permission(`${PERMISSION_CODE}:delete`),
  },
  {
    type: 'button',
    label: '启用',
    disabled: true,
    event: Enable,
    show: proxy.$permission(`${PERMISSION_CODE}:enable`),
  },
  {
    type: 'button',
    label: '停用',
    disabled: true,
    event: Deactivate,
    show: proxy.$permission(`${PERMISSION_CODE}:unenable`),
  },
  { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('票据类型模板', 'billType:download'), },
  ...uploadExcelBtns,
  { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData({}), },
])
const states = reactive({
  dialogVisible: false,
  row: null
})
const treeInfo = reactive({
  defaultProps: {
    children: 'children',
    label: (data, node) => { return data.code ? `${data.code}-${data.name}` : data.name },
  },
  expandOnClickNode: false,
  defaultExpandAll: true,
  current: null,
  filterText: '',
  data: []
})

const formInfo = reactive({
  ref: null,
  options: [],
  query: {
    name: "",
    enableStatus: '1'
  },
  data: {
  },
  fieldList: [
    { label: '票据类型编码', disabled: true, value: 'code', type: 'input' },
    { label: '票据类型名称',  value: 'name', type: 'input' },
    { label: '启用状态', value: 'enableStatus', type: 'select-model', code: 'enabled_type', disabled: true },
    { label: '创建组织',  value: 'orgName', type: 'input', disabled: true },
    { label: '备注',  value: 'remark', type: 'textarea' },
  ],
  disabled: true,
  rules: {
    code: [{ required: true, message: '请输入票据类型编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入票据类型名称', trigger: 'blur' }],
  },
  labelWidth: '120px',
})

onMounted(() => {
  getList()
})

function getList() {
  API.list({}).then(res => {
    if (res.success) {
      treeInfo.data = [
        { id: '-2', code: '', name: '票据类型', children: res.data }
      ]
    }
  })
}

function addNewData() {
  states.dialogVisible = true;
}

function save() {
  formInfo.ref.validate(flag => {
    if (flag) {
      const api = formInfo.data.id ? API.update : API.add
      api(formInfo.data).then(async res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          await getList()
          function findNode(nodes, code) {
            const node = nodes.find(_node => _node.code === code)
            if (node) return node
            for (const index in nodes) {
              const node = findNode(nodes[index].children || [], code)
              if (node) return node
            }
            return undefined
          }
          await handleNodeClick(findNode(treeInfo.data, formInfo.data.code))
        }
      })
    }
  })
}

function getNodeData(node) {
  if (!node || node.id == -2) return states.row = null
  states.row = node
  API.detail(node.id).then(res => {
    treeInfo.current = res.data
    formInfo.data = res.data
    treeInfo.currentNodeKey = res.data.id
    const del = menuButton.filter(it => it.label === '删除')[0]
    const enable = menuButton.filter(it => it.label === '启用')[0]
    const unenable = menuButton.filter(it => it.label === '停用')[0]
    del.disabled = enable.disabled = res.data.enableStatus === '1'
    unenable.disabled = res.data.enableStatus !== '1'
  })
}
function handleSearch() {
  proxy.$refs.menuTree.filter(formInfo.query.name);
}
function filterNode(value, data) {
  const NAME = data.name + data.code + ''
  return NAME.includes(value);
}

async function handleNodeClick(data) {
  await getNodeData(data)
}

// 启用
async function Enable() {
  if(!states.row) return
  const { code } = await API.enable([states.row.id])
  if (code === 200) {
    proxy.$message.success('启用成功')
    await getNodeData(states.row)
  }
}
// 停用
async function Deactivate() {
  if(!states.row) return
  const { code } = await API.deactivate([states.row.id])
  if (code === 200) {
    proxy.$message.success('停用成功')
    await getNodeData(states.row)
  }
}

function deleteClick() {
  const ids = [states.row.id]
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.del(ids).then(async ({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        await getList()
        if (treeInfo.data.length - 1 >= 0) {
          getNodeData({ id: treeInfo.data[0]['children'][treeInfo.data.length - 1].id || '-2' })
        }
      }
    })
  })
}
function diaLogeCallback(flag) {
  states.dialogVisible = false
  if (flag) {
    getList()
  }
}
</script>

<template>
  <div class="app-container">
      <div class="app-container-flex">
        <div class="left-container">
          <div class="left-container-header border-style-bottom">
            <span class="title">票据类型</span>
            <TreeButtons :filter-btn="menuButton">
            </TreeButtons>
          </div>
          <div class="left-container-header border-style-bottom show-placeholder">
            <el-input
                v-model="formInfo.query.name"
                :clearable="true"
                placeholder="请输入编码/名称"
                suffix-icon="Search"
                @keyup.enter="handleSearch"
            ></el-input>
          </div>
          <div class="left-container-main main-flex">
            <el-tree
                ref="menuTree"
                :data="treeInfo.data"
                highlight-current
                :props="treeInfo.defaultProps"
                node-key="id"
                :default-expand-all="true"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
            />
          </div>
        </div>
        <div class="right-container">
          <div class="layui-card-body border-style-bottom firstCard">
            <div class="layui-btn-container">
              <div class="rightContainerTitle">基础信息</div>
              <el-button
                  v-if="$permission(`${PERMISSION_CODE}:add`)"
                  type="primary"
                  class="el-button el-button--medium filter-button"
                  @click="save"
              >{{ $t("btn_save") }}</el-button
              >
            </div>
            <div class="model-panel-body paddingBox order-model-formBox">
              <page-form
                  v-model:ref-obj="formInfo.ref"
                  :data="formInfo.data"
                  :field-list="formInfo.fieldList"
                  :rules="formInfo.rules"
                  :label-width="formInfo.labelWidth"
              >
              </page-form>
            </div>
          </div>
        </div>
      </div>
    <add-edit
        v-if="states.dialogVisible"
        :title="states.title"
        :visible="states.dialogVisible"
        @callback="diaLogeCallback"
    />
  </div>
</template>
