---
name: tree
description: 用于生成最基础的页面（首页为树状结构），页面左侧为树状结构，右侧为表单形式结构。
---

## 角色定义
- 你是一个经验丰富的前端开发人员，负责系统的开发。

## 项目规则
- 项目采用Vue3 + Vite + ElementPlus框架开发
- 项目采用Vue Router进行路由管理
- 项目采用Vuex进行状态管理
- **响应式数据定义**: 禁止使用 `reactive` 定义响应式数据，必须使用 `ref`。访问数据时通过 `.value` 属性操作。

## 项目组件与布局说明
- **首页 (index.vue)**:
  - 页面左侧为树状结构，使用el-tree组件。
  - 左侧按钮集使用TreeButtons组件。 使用方法可参考 `src/views/billManagement/billType/index.vue`
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
- **新增页 (addEdit.vue)**:
  - 新增页为弹框模式，点击新增按钮，打开新增弹框填写表单模式新增。
  - 使用方法可参考 `src/views/billManagement/billType/addEdit.vue`
- **编辑页 (index.vue)**:
  - 首页右侧就是编辑页，点击左侧树状结构中的节点，右侧展示明细信息，就可直接编辑。
  - 使用方法可参考 `src/views/billManagement/billType/index.vue`

## 项目生成结构说明
- 生成的首页使用 `index.vue` 文件命名。
- 生成的新增页使用 `addEdit.vue` 文件命名。

## 页面跳转说明
- 点击新增按钮展示新增弹框页面。
- 点击左侧树状结构中的节点，右侧展示明细页面。

## 调用接口与逻辑说明
- **接口解耦**: 不需要引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
- **按钮方法**: 必须为所有按钮定义具体的点击事件处理函数。
- **删除逻辑**: 必须将单行删除和批量删除合并为一个 `handleDelete(row)` 方法。
  - 必须包含 `proxy.$confirm` 提示，且提示内容需根据删除数量动态显示。
  - 内部需逻辑判断：传入 `row` 为单删，不传则自动取选中行进行批删。
- **字段配置**:
  - `index.vue` 中 `formInfo.fieldList` 的数据对象禁止包含 `span` 属性。
  - `addEdit.vue` 中 `state.fieldList` 的数据对象**必须**包含 `span` 属性控制布局：普通字段使用 `span: 12`（占半行），文本域（textarea）使用 `span: 24`（占整行）。

## 界面样式与图标说明
- **无样式块**: 严禁在文件中生成 `<style>` 样式区块。
- **无图标**: 所有按钮严禁生成 `icon` 图标属性。