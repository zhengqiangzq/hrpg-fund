---
name: funds-code-review
description: 对资金系统（funds）子应用进行全面代码审查，覆盖 Wujie 子应用通信、Vuex 状态管理、接口规范、动态路由、全局组件、自定义指令、性能、安全、Vue 3 最佳实践等维度。触发词：review、审查、code review、代码检查。
category: quality
tags: [review, quality, vue3, micro-frontend, wujie, hrp, funds]
---

# 前端 Code Review 技能（funds 子应用）

## 概述

HRP 新财务系统（`hrpg_fund_web`）是 Wujie 微前端体系中的 SPD 财务子应用（系统编码 `/funds`），基于 Vue 3 + Vite 5 + Vuex 4 + Element Plus 构建。

---

## 审查工作流程

### 1. 确定范围

- **用户指定了文件/目录/commit**：直接审查指定范围
- **用户未指定**：审查当前 `git diff`（未提交改动）
- **diff 为空**：提示用户指定范围

### 2. 逐维度审查 + 输出报告

| 级别 | 含义 |
|------|------|
| 🔴 严重 | 会导致运行时错误、数据丢失、安全漏洞，**必须修复** |
| 🟡 警告 | 违反项目规范、潜在 bug、性能隐患，**建议修复** |
| 🔵 建议 | 代码风格、最佳实践，**可选修复** |

---

## 项目编码约定（审查时免报）

以下为项目实际约定，**审查时不应报告为问题**：

| # | 约定 | 说明 |
|---|------|------|
| 1 | **允许 `proxy`** | `getCurrentInstance().proxy` 访问全局属性是通用模式 |
| 2 | **不强制 `.catch()` / try-catch** | `request.js` 拦截器已统一处理错误响应 |
| 4 | **不要求国际化** | 中文硬编码即可，无需 `$t()` |
| 5 | **btnCode 范围** | 仅业务操作（新增/修改/删除/查询/保存/导出/导入/下载）需要传 btnCode；纯数据获取（树加载、下拉选项、详情回显）无需 |

---

## 审查维度

### 一、Wujie 子应用通信

> 适用范围：`permission.js`、`layout/index.vue`、`main.js`、`store/modules/user.js`

- `[error]` 必须用 `window.__POWERED_BY_WUJIE__` 判断嵌入/独立运行环境
- `[error]` 独立运行时不能访问 `window.$wujie`（undefined）
- `[error]` Token 失效/退出登录必须通知主应用：`window.$wujie?.bus.$emit('microAppLogout')`
- `[error]` 路由变更必须通知主应用：`window.$wujie?.bus.$emit('subMicroAppRouteChange', { path, query })`
- `[error]` 不要直接调用主应用的菜单/权限接口
- `[warn]` 监听主应用事件（`$on`）时，组件卸载前必须 `$off` 清理
- `[warn]` 数据来源优先级：Wujie props → IndexedDB → 接口
- `[warn]` `localStorage` 读取需加判空；URL 含 `businessOrgId` + `businessGroupId` 时需跨组织请求

---

### 二、接口层规范

> 适用范围：`utils/request.js`、`api/` 目录、所有 HTTP 调用

- `[error]` 业务操作请求**必须**传 `btnCode`（新增/修改/删除/查询/保存/导出/导入/下载）；纯数据获取无需
- `[error]` 文件下载必须用 `request.js` 导出的 `download()`，不要绕过 `request` 实例直接 `axios`
- `[error]` `code === 800` → Token 失效，通知主应用登出或跳转 `/login`
- `[warn]` 轮询/自动刷新请求必须 `notShowLoading: true`
- `[warn]` 不要覆盖拦截器自动注入的请求头；`btnCode: -2` 是默认值

---

### 三、状态管理（Vuex 4）

- `[error]` 所有模块 `namespaced: true`；不要直接修改 `state`，通过 `commit`/`dispatch`
- `[error]` Token 通过 `utils/auth.js` 读取；`generateRoutes` 成功后才放行路由
- `[warn]` 字典/权限码/系统配置从 IndexedDB 获取，不要绕过 Store 直接操作 `localStorage`

---

### 四、路由规范

- `[error]` 不得跳过 Token 校验（白名单除外：`/login`、`/oa`）；`addRoute` 失败必须 catch 并登出
- `[error]` `import.meta.glob` 路径须与 views 目录一致；`@vite-ignore` 不可移除
- `[warn]` 组件匹配失败应有降级，不能白屏；路由 base 与构建 base 一致
- `[info]` 路由 `meta.title` 用于页面标题和标签页

---

### 五、组件开发规范

**全局注册** `[error]`：
- 公共组件放在 `components/{Name}/index.vue`，自动扫描注册，不要重复注册
- 流程表单必须在 `utils/flowable.js` 的 `asyncComponentPathArr` 中注册

**Composition API** `[warn]`：
- 优先 `<script setup>`；`computed` 无副作用；`watch` 不修改被监听数据
- 复杂逻辑抽取为 `hooks/`

**生命周期** `[error]`：
- 定时器/Observer/事件监听必须在 `onBeforeUnmount` 清理
- `keep-alive` 组件用 `onActivated`/`onDeactivated`

**其他**：
- `[error]` 按钮权限用 `v-hasPermi`，不能仅前端隐藏
- `[info]` Props 有类型和默认值；Emits 显式声明；`v-model` 遵守 `modelValue` + `update:modelValue`

---

### 六、代码风格

- 项目配置：无分号、单引号、4 空格缩进、LF 换行、100 字符换行
- 命名：组件 PascalCase + `index.vue`，hooks `use` 前缀，CSS kebab-case
- API 按模块分文件，工具函数按职责拆分

---

### 七、性能优化与内存泄漏

**性能优化**：

- `[warn]` 大列表分页；`v-for` 唯一 `key`；`v-if`/`v-for` 不同元素；频繁切换用 `v-show`
- `[warn]` 非首屏异步加载；`lodash-es` 而非 `lodash`
- `[info]` 新增依赖加入代码分割分组；SVG 用雪碧图加载

**内存泄漏**（`[error]`，必须在 `onBeforeUnmount` / `onDeactivated` 中清理）：

- `[error]` **`setInterval` / `setTimeout` 未清理**：`clearInterval` / `clearTimeout`
- `[error]` **`addEventListener` 未 `removeEventListener`**：原生事件监听 Vue 不会自动回收
- `[error]` **`IntersectionObserver` / `ResizeObserver` / `MutationObserver` 未 `disconnect()`**
- `[warn]` **WebSocket 未 `close()`**：页面离开时关闭连接
- `[warn]` **全局事件总线 `$bus.$on` 未 `$off`**（同维度一）

---

### 八、安全性

- `[error]` Token 通过 `utils/auth.js` 存取，不在 URL 传递（一次性回调除外）
- `[error]` 敏感操作（删除、导出）需二次确认
- `[warn]` 用户输入用 `v-text`/`{{ }}` 而非 `v-html`；不硬编码密钥/密码
- `[warn]` 生产环境 `console` 已配置移除，勿输出敏感信息

---

### 九、常见反模式（高频缺陷）

| 反模式 | 正确做法 |
|--------|----------|
| 业务操作请求遗漏 `btnCode` | 增/改/删/查/导出/导入等必须传 btnCode |
| 忘记 `window.__POWERED_BY_WUJIE__` 判断 | 先判断再访问 `window.$wujie` |
| 直接调主应用菜单/权限接口 | 从 localStorage/IndexedDB 读取 |
| 忘记清理定时器/监听器/Observer | `onBeforeUnmount` 中清理 |
| `v-html` 渲染用户输入 | 用 `v-text` 或服务端净化 |
| `.map()` 用于副作用 | 改为 `.forEach()` |
| `ref()` 忘写 `.value`（`<script setup>` 中） | `tableInfo.value.xxx` 而非 `tableInfo.xxx` |
| `watch(obj, ...)` 浅监听 | 改为 `watch(() => obj.key, ...)` 或 `{ deep: true }` |
| 流程表单未在 flowable.js 注册 | 添加 `defineAsyncComponent` |

---

### 十、异步与并发处理

- `[warn]` **独立请求在循环中串行 `await`**：无依赖的多个请求应用 `Promise.all` 并发，而非 `for` + `await` 逐个等待

---

### 十一、Vue 3 响应式陷阱

- `[error]` **解构 `props` 丢失响应式**：`const { name } = props` 后 `name` 不再响应，应用 `toRefs(props)` 或始终 `props.xxx` 访问
- `[error]` **`ref()` 忘写 `.value`**（`<script setup>` 中 JS 访问必须 `.value`）
- `[warn]` **`watch` 监听 `reactive`/`ref` 对象属性时未用 getter**：`watch(obj.prop, ...)` 应改为 `watch(() => obj.prop, ...)`
- `[warn]` **`watchEffect` 中修改被监听数据导致无限循环**：避免在回调中修改触发该 `watchEffect` 重新执行的响应式数据
- `[info]` **大对象用 `shallowRef`**：仅关心整体替换（不关心深层属性变更）的数据用 `shallowRef` 减少响应式开销

---

### 十二、空值/边界防御

- `[warn]` **深层属性访问缺可选链**：`data.list[0].name` 在 `list` 为空时 `undefined.name` 报错，用 `?.` 或判空保护
- `[warn]` **API 返回数据直接使用未判空**：`response.data.xxx` 未判断 `response?.data` 是否存在
- `[warn]` **`v-for` 数据源可能为 `null`/`undefined`**：模板中 `.length` / `[0]` 访问未判空导致渲染崩溃
- `[info]` 枚举/字典未加载完成时控件显示异常（select-model 依赖的字典异步加载期间显示空白）

---

### 十三、代码组织与可维护性

- `[error]` **大量注释掉的代码**：提交到仓库的注释代码应直接删除，需要时从 git 历史恢复
- `[warn]` **单个文件超过 300 行**：拆分为 hooks / 子组件 / 工具函数
- `[warn]` **同一逻辑复制粘贴 ≥2 次**：提取为公共函数或 hooks
- `[info]` **函数超过 50 行且职责混杂**：按数据获取 / 状态更新 / UI 交互拆分

**业务方法注释规范**：

> 判断一个业务方法是否需要注释的核心标准：**新接手者能否在 30 秒内仅通过阅读方法体理解其核心意图和数据流向。** 满足以下任意 **2 条及以上**即视为复杂方法，必须有注释说明。

**复杂度判定条件**：

| # | 条件 | 示例 |
|---|------|------|
| 1 | 方法行数 > 30 行（不含空行和纯注释行） | 一个提交方法涵盖校验→组装→调用→后处理 |
| 2 | 条件分支（`if`/`else if`/`else`/`switch`）层级 ≥ 3 层 | 深层嵌套的业务规则判断 |
| 3 | 涉及 ≥ 3 个异步操作且有先后依赖关系 | 先查 A 接口，取结果再查 B，B 结果决定是否调 C |
| 4 | 数据处理包含 ≥ 2 次格式转换/映射/聚合 | 数组 → 按 key 分组 → 每组再算合计 |
| 5 | 多个状态变量（≥ 3 个 `ref`/`reactive`）协同变化 | 表单切换时联动清空/回填多个字段 |
| 6 | 需要理解特定业务背景才能读懂意图 | 审批流程节点跳过规则、财务科目冲销逻辑 |

**判定流程**：
1. 逐条核对上述 6 个条件，统计命中数
2. 命中 ≥ 3 条 → 🟡 **严重**：复杂方法，必须有注释
3. 命中 = 2 条 → 🔵 **警告**：有一定复杂度，建议添加注释
4. 命中 ≤ 1 条 → 非复杂方法，不强制要求注释

- `[warn]` **复杂方法（命中 ≥ 3 条）缺少注释**：
  - 无方法级注释说明"做什么 + 为什么"（业务目的、整体流程步骤）
  - 无关键步骤注释（多步骤间无分段说明，异步依赖链无标注）
  - 条件分支复杂（命中条件 #2）但分支条件无注释说明业务含义
  - 状态联动复杂（命中条件 #5）但各状态变量的职责和联动关系无说明
- `[info]` **有一定复杂度的方法（命中 = 2 条）建议添加注释**：
  - 方法级注释说明主要职责和关键步骤
  - 非显而易见的逻辑块加简要注释
- `[info]` **通用注释建议（即使命中 ≤ 1 条也建议）**：
  - 复杂正则表达式、位运算、非显而易见算法无注释
  - 魔术数字（非 `0`/`1`/`-1`/`true`/`false` 的硬编码值）无注释说明含义
  - 对外暴露的公共 Hooks / 工具函数缺少 JSDoc（`@param`、`@returns`、`@description`）
  - 使用了 workaround/hack 绕过框架或第三方库限制但无注释解释原因
  - 函数有隐含前置条件（如"调用前必须先设置 xxx"）或副作用（如"会同时更新 localStorage"）但未注释

---

## 输出要求

1. 按 🔴→🟡→🔵 排序，每条给出**行号 + 问题 + 修复建议 + 👤责任人（git blame）**
2. 开篇概览 + 结尾正面反馈
3. 生成离线文档至 `src/reviewDocs/{用户名}_{YYYYMMDD}_{HHmm}.md`（纯 Markdown）
   - **⚠️ 文件名和文档内审查时间必须获取实际时间，禁止凭感觉估算**
   - **⚠️ 文件必须强制生成**
4. **仅输出建议，不主动修改**：除非用户明确说"帮我修复"/"写到文件里"等，否则只输出报告到终端 + 生成离线文档即结束
