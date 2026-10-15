<template>
<!-- 成本项目 -->
  <div class="app-container">
    <div class="app-container-flex">
      <div class="left-container">
        <div class="left-container-header">
          <span class="title">成本项目</span>
        </div>
        <div class="left-container-header border-style-bottom show-placeholder">
          <el-input
              v-model="treeInfo.query.name"
              :disabled="state.addBtn"
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
              :default-expanded-keys="treeInfo.treeData"
              :default-checked-keys="[treeInfo.checked]"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
          />
        </div>
      </div>
      <div class="right-container">
            <div class="filter-wrapper">
            <!-- 条件栏 -->
            <NewPageFilter
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.searchList"
                :filter-btn="filterInfo.filterbtn"
            >
            </NewPageFilter>
          </div>
            <div class="filter-wrapper">
            <!-- 按钮 -->
            <NewPageFilter
                :filterBtn="filterInfo.btnList"
            >
              <template v-slot:filter-uploadFile>
                <el-upload
                    :headers="uploadInfo.headers"
                    :show-file-list="false"
                    :on-success="uploadSuccess"
                    v-model:file-list="uploadInfo.fileList"
                    :on-error="uploadError"
                    :before-upload="beforeUpload"
                    :action="uploadInfo.action"
                >
                  <el-button>导入</el-button>
                </el-upload>
              </template>
            </NewPageFilter>
          </div>
          <table-container
              :refresh="tableInfo.refresh"
              :init-curpage="tableInfo.initCurpage"
              v-model:data="tableInfo.data"
              :api="tableInfo.api"
              :tab-index="true"
              :highlightRow="true"
              :query="filterInfo.query"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="SelectionChange"
              :checkBox="true"
              @pageInfo="pageInfo"
          >
          </table-container>
      </div>
    </div>

  </div>
</template>

<script setup name="costProject">
import {useStorage} from "@vueuse/core";
import {useUpload} from "@/hooks/useUpload";
import {
  accountControlRuleadd,
  accountControlRuleDelete, accountControlRuleExcel,
  accountControlRulePage, accountControlRuleUpdate
} from "@/api/accountInitialization/cashAccountRulesn";
const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'costProject'
const state = reactive({
  //控制左侧树节点上方新增按钮状态
  addBtn: false,
  addOrUpdate: "",
  categoryId: "",
  treeRow: '',
  isAddUpdate: "add",
  flag: true,
});

const multipleSelection = ref([]);
const currentRow = ref({});

const from = ref()
const clearType = ref(true)

const setting = useStorage('setting', {}, sessionStorage)

const API = {
  query: accountControlRulePage,
  table: accountControlRulePage,
  delete: accountControlRuleDelete,
  enable: accountControlRuleDelete,
  disable: accountControlRuleDelete,
  add: accountControlRuleadd,
  update: accountControlRuleUpdate,
  export: accountControlRuleExcel,
}

const {
  exportData,
} = useUpload(API)

// 过滤相关配置
const filterInfo = ref({
  ref: null,
  query: {
    sort: 'create_time desc,id asc',
  },
  searchList: [

    {
      label: "成本项目",
      value: "name",
      type: 'input',
      event: search,
    },
    {
      type: 'select-model',
      label: '是否项目核算',
      value: 'itemAccountStatus',
      code: 'yes_or_no',
      event: search,
    },
    {
      type: 'select-model',
      label: '是否病种核算',
      value: 'diseaseAccountStatus',
      code: 'yes_or_no',
      event: search,
    },
    {
      type: 'select-model',
      label: '是否药品',
      value: 'drugStatus',
      code: 'yes_or_no',
      event: search,
    },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: search, },
    { type: 'button', label: '重置', event: clearSearch, },
  ],
  btnList: [
    {
      label: '新增',
      value: 'flowDate',
      event: addBtn,
      show: proxy.$permission(`${PERMISSION_CODE}:add`),
      type: 'button',
      disabled: true,
    },
    {
      label: '删除',
      value: 'flowDate',
      event: deleteBtn,
      show: proxy.$permission(`${PERMISSION_CODE}:delete`),
      type: 'button',
    },
    {
      label: '启用',
      value: 'flowDate',
      event: Enable,
      show: proxy.$permission(`${PERMISSION_CODE}:enable`),
      type: 'button',
    },
    {
      label: '停用',
      value: 'flowDate',
      event: Deactivate,
      show: proxy.$permission(`${PERMISSION_CODE}:enable`),
      type: 'button',
    },
    {
      type: 'button',
      label: '分配',
      event: () => allocation(),
      show: proxy.$permission(`${PERMISSION_CODE}:list`) && proxy.$fn.getControl(allocationDataType),
      disabled: () => {
        return !multipleSelection.value.length
      },
    },
    {
      type: 'button',
      label: '取消全部分配',
      event: () => cancelAllocation(),
      show: proxy.$permission(`${PERMISSION_CODE}:list`) && proxy.$fn.getControl(allocationDataType),
    },
    {
      label: '下载模板',
      value: 'flowDate',
      event: () => downloadTemplate('成本项目导入模板', `${PERMISSION_CODE}:downloadTemplate`),
      show: proxy.$permission(`${PERMISSION_CODE}:downloadTemplate`),
      type: 'button',
    },
    {
      type: 'slot',
      value: 'uploadFile',
      show: proxy.$permission(`${PERMISSION_CODE}:uploadFile`),
    },
    {
      label: '导出Excel',
      value: 'flowDate',
      event: () => exportData(filterInfo.copyQuery),
      show: proxy.$permission(`${PERMISSION_CODE}:exportExcel`),
      type: 'button',
    },
  ]
});

// 权限树
const treeInfo = reactive({
  data: [],
  query: {
    name: ''
  },
  nodeKey: "code",
  treeData: [],
  checked: [],
  defaultProps: {
    children: "children",
    label: function (data, node) {
      if (data.code) {
        return data.code + " " + data.name;
      } else {
        return data.name;
      }
    },
  },
});
// 表格相关
const tableInfo = ref({
  refresh: 1,
  initCurpage: 1,
  api: '',
  data: [],
  fieldList: [
    { label: '成本项目编码', value: 'code' },
    { label: '成本项目名称', value: 'name' },
    { label: '上级成本项目编码', value: 'parentCode' },
    { label: '上级成本项目名称', value: 'parentName' },
    { label: '成本类别编码', value: 'costCategoryCode' },
    { label: '成本类别名称', value: 'costCategoryName' },
    { label: '成本属性', value: 'costAttributeName' },
    { label: '可控属性', value: 'controlTypeName' },
    { label: '是否药品', value: 'drugStatusName' },
    { label: '是否项目核算', value: 'itemAccountStatusName' },
    { label: '是否病种核算', value: 'diseaseAccountStatusName' },
    { label: '状态', value: 'statusName' },
    { label: '备注', value: 'remark' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '140',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: update,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        popconfirmText: '删除后将改变数据,是否继续？',
        event: romove,
      },
      {
        label: '分配详情',
        show: proxy.$permission(`${PERMISSION_CODE}:list`) && proxy.$fn.getControl(allocationDataType),
        event: allocationDetail,
      },
    ],
  },
})

const formOrgInfo = reactive({
  ref: null,
  data: {},
  fieldList: [],
  rules: {},
  btnList: [],
});
watch(
    () => treeInfo.data,
    () => {
      state.addBtn = false;
    },
    {
      deep: true,
    }
);


watch(() => multipleSelection.value, (rows) => {
  const btns = filterInfo.value.btnList
  const deleteBtn = btns.filter((it) => it.label === '删除')[0]
  const confirmBtn = btns.filter((it) => it.label === '启用')[0]
  const cancelBtn = btns.filter((it) => it.label === '停用')[0]
  deleteBtn.disabled = !rows.length
  confirmBtn.disabled = !rows.length || !!rows.filter(row => row.status !== '0').length
  cancelBtn.disabled = !rows.length || !!rows.filter(row => row.status === '0').length
}, { immediate: true })

//由pageInfo更新
const page = ref({
  page: true,
  curPage: 1, // 当前页
  pageSize: 20, // 每页条数
})
function pageInfo(obj) {
  page.value = obj
}
onMounted(() => {
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  init();
});
function init() {
  API.query().then((res) => {
    if (res && res.success) {
  let data = res.data;
  treeInfo.data = [
    {
      children: data,
      code: '',
      name: '成本分类',
      id: '-1'
    }
  ]
  if (treeInfo.query.name) {
    treeInfo.treeData = [];
    getNodeId(data, -1);
  } else {
    treeInfo.treeData = [];
    getNodeId(data, 2);
  }
  }
  });
}
function getNodeId(data, num, count = 0) {
  count++;
  if(!data) return
  data.forEach((item) => {
    if (count === num) {
      return;
    }
    treeInfo.treeData.push(item.id);
    if (item.children && item.children.length) {
      getNodeId(item.children, num, count);
    }
  });
}

// 启用
function Enable() {
  if (multipleSelection.value.length === 0) return proxy.$message.warning('请勾选数据')
  const ids = multipleSelection.value.map((it) => it.id)
  API.enable(ids).then((res) => {
    if (res.success) {
      proxy.$message.success('启用成功')
      search();
    }
  })
}
// 停用
function Deactivate() {
  if (multipleSelection.value.length === 0) return proxy.$message.warning('请勾选数据')
  const ids = multipleSelection.value.map((it) => it.id)
  API.disable(ids).then((res) => {
    if (res.success) {
      proxy.$message.success('停用成功')
      search();
    }
  })
}

// 按钮
function search() {
  tableInfo.value.api = API.table
  tableInfo.value.refresh = Math.random()
}
function clearSearch() {
  clearType.value = !clearType.value
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  search()
}

// table选择
function SelectionChange(val,data) {
  if(val === 'list') return
  if (val === "tableClickRow") {
    currentRow.value = data;
  } else {
    multipleSelection.value = data
    selectLoids.value = data.map(it => it.id)
  }
}
// 删除成本项目
function deleteBtn() {
  if(multipleSelection.value.length === 0) return proxy.$message.warning('请勾选数据')
  const ids = multipleSelection.value.map((it) => it.id)
  proxy
      .$confirm("是否确认删除所选数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        API.delete(ids).then((res) => {
          if (res.success) {
            proxy.$message.success('删除成功')
            search()
          }
        });
      })
      .catch(() => {});
}
// 新增
function addBtn() {
  state.id = null;
  formOrgInfo.data = {
    status: "1",
    costCategoryCode: state.treeRow?.code,
    costCategoryName: state.treeRow?.name,
    costCategoryId: state.treeRow?.id,
    parentCode: currentRow.value?.code,
    parentName: currentRow.value?.name,
    parentId: currentRow.value?.id,
    drugStatus: state.treeRow?.code === '03' ? '1' : '0',
    itemAccountStatus: (state.treeRow?.code === '02' || state.treeRow?.code === '03') ? '0' : '1',
    diseaseAccountStatus: '1',
  };
  state.title = '新增成本项目';
  state.addBtn = true;
}

// 点击编辑
async function update(row) {
  state.addBtn = true;
  state.title = '修改成本项目';
  formOrgInfo.data = row;
  state.id = row.id;
}


function diaLogeCallback(flag) {
  if (flag) {
    state.id = null;
    search()
  } else {
    state.addBtn = false
  }
}
// 点击树节点
function handleNodeClick(node) {
  const btns = filterInfo.value.btnList
  if (["-1"].includes(node.id)) {
    state.categoryId = node.id;
    filterInfo.value.query.costCategoryName = '';
    filterInfo.value.query.costCategoryId = '';
    filterInfo.value.query.costCategoryCode = '';
    btns[0].disabled = true;
    search();
    return;
  }
  btns[0].disabled = false;
  // if (node) {
  //   disableDelBtn.value = node.children?.length > 0 ? true : false;
  // } else {
  //   disableDelBtn.value = true;
  // }

  state.isAddUpdate = "update";
  state.categoryId = node.id;
  state.treeRow = node;
  if (node.id !== "-1") {
    state.categoryId = node.id;
    filterInfo.value.query.costCategoryName = node.name;
    filterInfo.value.query.costCategoryId = node.id;
    filterInfo.value.query.costCategoryCode = node.code;
    search();
  }
}
// 点击删除
async function romove(row) {

  await API.delete([row.id]).then((res) => {
    if (res.success) {
      proxy.$message.success('删除成功')
      search()
    }
  });
}

function handleSearch() {
  proxy.$refs.menuTree.filter(treeInfo.query.name);
}
function filterNode(value, data) {
  const filterName = `${data.code}${data.name}`
  return filterName.includes(value);
}
</script>

<style lang="scss" scoped>
.left-container {
  min-width: 350px;
  .left-container-header {
    display: flex;
    justify-content: flex-start;
    padding: 5px 0;
    box-sizing: border-box;
  }
  .border-style-bottom {
    margin-bottom: 0;
  }
}
.main-flex {
  flex-grow: 1;
  display: flex;
  flex-wrap: nowrap;
  height: calc(100% - 120px);
  .el-tree {
    width: 100%;
    padding: 0 20px 20px;
    overflow-y: auto;
  }
}
</style>
