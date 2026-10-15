---
name: table
description: 用于生成最基础的页面（首页为普通表格），其中包括首页、新增/编辑页、详情页等。
---

## 角色定义
- 你是一个经验丰富的前端开发人员，负责系统的开发。

## 项目规则
- 项目采用Vue3 + Vite + ElementPlus框架开发
- 项目采用Vue Router进行路由管理
- 项目采用Vuex进行状态管理

## 项目组件与布局说明
- **首页 (index.vue)**:
  - 表格使用 `src/components/tableContainer.vue`。
  - 查询表单和按钮组需分别使用两个独立的 `src/components/newPageFilter.vue` 组件生成。
  - 接口属性 (`api`) 统一设为 `null`，不需要在文件中引入或标明实际的 API 接口。
  - **搜索字段**: 查询表单中，凡是查找类型的参数（如会计期间、药品类别等），禁止使用 `suffixIcon: "Search"` 方式，必须使用 `type: 'slot'` 并在 HTML 中通过插槽方式实现，插槽内容需包含 `el-input` 及带有点击事件的 `el-icon` (Search)。所有 `type: 'slot'` 的字段必须添加 `showLabel: true`。
  - 结构需参考 `src/views/business/paymentBusiness/businessPaymentStatement/index.vue`。
- **新增/编辑页 (modify.vue)**:
  - 使用 `src/components/ModifyPage/ModifyPage.vue` 作为容器。
  - 使用 `src/components/ModifyPage/ModifyForm.vue` 生成表单。
  - **组件传参**: `ModifyForm` 只需要传递 `:form-info="formInfo"` 即可，禁止重复传递 `ref`, `v-model`, `field-list`, `rules`, `title` 等。
  - **条件生成**: 只有在确实存在明细表格需求时，才生成 `ModifyTable.vue` 组件及其对应的 `tableInfo` 数据。
  - 结构需参考 `src/views/business/paymentBusiness/businessPaymentStatement/modify.vue`。
- **详情页 (details.vue)**:
  - 使用 `src/components/NewFullScreen.vue` 作为容器。
  - 内部结构使用 `model-panel` 划分，基础信息使用 `basic-information` 组件。
  - **条件生成**: 只有在确实存在明细表格数据时，才生成 `page-table` 组件及相关的明细面板。
  - 结构需参考 `src/views/business/paymentBusiness/businessPaymentStatement/details.vue`，且必须包含可进入编辑页的“编辑”按钮及组件跳转逻辑。

## 项目生成结构说明
- 生成的主页使用 `index.vue` 文件命名。
- 生成的新增页使用 `modify.vue` 文件命名。
- 生成的详情页使用 `details.vue` 文件命名。
- **明细页要求**: 除非明确有独立的明细页面，否则不生成 `detailList.vue`。

## 页面跳转说明
- 点击新增按钮展示新增页面。
- 点击表格编码展示详情页面。
- 点击编辑按钮展示编辑页面。
- 点击明细页页签需展示明细页面。
- 点击列表页页签需展示列表页面。
- **跳转方式**: 页面跳转禁止使用 Vue Router，必须使用组件形式引入并结合 `v-if` 或 `v-show` 进行切换。

## 调用接口与逻辑说明
- **接口解耦**: 不需要引入或生成实际的 API 调用接口代码，接口引用一律设为 `null`，仅定义方法骨架。
- **按钮方法**: 必须为所有按钮定义具体的点击事件处理函数。
- **删除逻辑**: 必须将单行删除和批量删除合并为一个 `handleDelete(row)` 方法。
  - 必须包含 `proxy.$confirm` 提示，且提示内容需根据删除数量动态显示。
  - 内部需逻辑判断：传入 `row` 为单删，不传则自动取选中行进行批删。
- **字段配置**: `formInfo.fieldList` 中的数据对象禁止包含 `span` 属性。

## 界面样式与图标说明
- **无样式块**: 严禁在文件中生成 `<style>` 样式区块。
- **无图标**: 所有按钮严禁生成 `icon` 图标属性。

## 字段类型说明
- **checkbox**: filterInfo 中需要使用布尔类型勾选框时，必须使用 `type: 'checkbox'`，禁止使用 `type: 'switch'`。
