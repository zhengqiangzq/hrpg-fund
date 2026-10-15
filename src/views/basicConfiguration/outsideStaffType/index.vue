<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {
  addOutsideStaffClass, deleteOutsideStaffClass, oneOutSideStaffClass,
  treeOutsideStaffClass,
  updateOutsideStaffClass
} from "@/api/basicConfiguration/outsideStaffType";

const PERMISSION_CODE = 'outsideStaffType'
defineOptions({
  name: PERMISSION_CODE
})
const { proxy } = getCurrentInstance()

const menuButton = reactive([
  {
    type: 'button',
    label: '新增',
    event: addNewData,
    show: proxy.$permission(`${PERMISSION_CODE}:add`),
  }
])
const modifyButton = reactive([
  {
    type: 'button',
    label: '保存',
    event: save,
    show: proxy.$permission(`${PERMISSION_CODE}:add`),
  }
])
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
  data: {
  },
  fieldList: [
    { label: '院外人员类型编码',  value: 'code', type: 'input' },
    { label: '院外人员类型名称',  value: 'name', type: 'input' },
    { label: '上级院外人员类型',  value: 'parentName', type: 'input', disabled: true },
    { label: '备注',  value: 'remark', type: 'textarea', width: '300px' },
  ],
  disabled: true,
  rules: {
    code: [{ required: true, message: '请输入人员类型编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入人员类型名称', trigger: 'blur' }],
  },
})

watch(() => treeInfo.current, (current) => {
  menuButton[0].disabled = !current
}, { immediate: true })

onMounted(() => {
  loadTreeData()
})

function loadTreeData() {
  treeOutsideStaffClass({}).then(res => {
    if (res.success) {
      treeInfo.data = [
        { id: '-2', code: '', name: '院外人员类型', children: res.data }
      ]
    }
  })
}

function addNewData() {
  formInfo.data = {
    parentId: treeInfo.current.id,
    parentName: treeInfo.current.name
  }
  formInfo.disabled = false
}

function save() {
  formInfo.ref.validate(flag => {
    if (flag) {
      const api = formInfo.data.id ? updateOutsideStaffClass : addOutsideStaffClass
      api(formInfo.data).then(async res => {
        if (res.success) {
          proxy.$message.success('保存成功')
          await loadTreeData()
          formInfo.disabled = true
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
  if (!node || node.id == -2) return
  oneOutSideStaffClass(node.id).then(res => {
    treeInfo.current = res.data
    formInfo.data = res.data
    treeInfo.currentNodeKey = res.data.id
  })
}

async function handleNodeClick(data) {
  treeInfo.current = data
  await getNodeData(data)
  formInfo.disabled = true
}

async function editClick(row) {
  await getNodeData(row)
  formInfo.disabled = false
}

function deleteClick(row) {
  const ids = [row.id]
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    deleteOutsideStaffClass(ids).then(async ({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        await loadTreeData()
        getNodeData({ id: row.parentId || '-2' })
      }
    })
  })
}
</script>

<template>
  <div class="app-container">
    <div class="fullBox">
      <div class="filter-wrapper">
        <NewPageFilter :filter-btn="menuButton">
        </NewPageFilter>
      </div>
      <div class="app-container-flex">
        <div class="left-container">
          <page-tree
              :tree-info="treeInfo"
              @node-click="handleNodeClick"
          >
            <template #operate="scope">
              <template v-if="scope.data.id != -2">
                <el-icon @click.stop="editClick(scope.data)"><Edit /></el-icon>
                <el-icon @click.stop="deleteClick(scope.data)"><Delete /></el-icon>
              </template>
            </template>
          </page-tree>
        </div>
        <div class="right-container">
          <NewPageFilter v-if="!formInfo.disabled" className="right" :filter-btn="modifyButton">
          </NewPageFilter>
          <page-form
              v-model:ref-obj="formInfo.ref"
              :disabled="formInfo.disabled"
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
</template>

<style scoped lang="scss">
.fullBox {
  display: flex;
  flex-direction: column;
}
:deep(.right) {
  display: flex;
  justify-content: end;
}
</style>
