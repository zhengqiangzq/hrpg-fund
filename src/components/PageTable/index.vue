<template>
  <div
    class="page-table set-width-class"
    :class="[className, tableRandom]"
    :id="tableId"
    :style="{
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <!-- 显示表格 -->
    <el-table
      v-if="isShowTable"
      ref="table"
      v-loading="listInfo.loading"
      :show-overflow-tooltip="true"
      :data="data"
      border
      :style="{ flex: 1 }"
      :show-summary="summary"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :summary-method="summariesFn || getSummaries"
      :row-key="rowKey"
      :expand-row-keys="!isGroupSearch ? expands : []"
      :highlight-current-row="highlightRow"
      :span-method="defaultSpanMethod"
      :tree-props="treeProps"
      :height="afterDynamic ? tableContainerHeight + 'px' : 0"
      :default-expand-all="defaultExpandAll"
      @row-click="getAddLisy"
      @current-change="clickRow"
      @expand-change="exChange"
      @select="onSelect"
      @select-all="onSelectAll"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
      @rowDblclick="rowDblclick"
    >
      <el-table-column
        v-if="checkBox"
        :reserve-selection="reserveSelection"
        type="selection"
        fixed="left"
        align="center"
        width="40"
        :selectable="selectable"
      />
      <el-table-column
        v-if="tabIndex"
        :key="'index'"
        type="index"
        align="center"
        fixed="left"
        label="序号"
        :width="fieldList.length === 0 ? '' : 60"
      >
        <template v-slot="scope">
          <span v-if="!indexMethod">{{
            scope.$index +
            1 +
            (listInfo.query.pageNo - 1) * listInfo.query.pageSize
          }}</span>
          <span v-else>{{ indexMethod(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in fieldList.filter((item) => !item.hidden)"
        :key="index"
        :prop="item.value"
        :label="item.label"
        :fixed="item.fixed"
        :formatter="item.formatter"
        :filters="item.filters"
        :filter-method="item.filterMethod"
        :header-align="item.headerAlign || 'center'"
        :align="item.align === 'right' ? 'right' : 'left'"
        :type="item.columnType"
        :sortable="item.sortable"
        :width="item.width"
        :min-width="item.minWidth || '120px'"
        show-overflow-tooltip
      >
        <template #header="scope">
          <div @mouseover="onMouseOverTable(item.value)">
            <el-tooltip
              placement="top"
              :disabled="isShowTooltip"
              :content="scope.column.label"
            >
              <div :ref="'parent' + item.value" class="ellipse-text">
                <span style="color: var(--el-color-danger); margin-right: 4px;" v-if="item.required || !!item.rules?.find(it => it.required)">*</span>
                <span :ref="item.value">{{ scope.column.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </template>
        <template v-if="item.type !== 'column'" v-slot="scope">
          <template v-if="scope.$index >= 0 && (!item.editControl || item.editControl(scope.row))">
            <!-- solt 自定义列-->
            <el-form-item
                v-if="item.type === 'slot'"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
                style="width: 100%"
            >
              <slot
                  :name="'col-' + item.value"
                  :row="scope.row"
                  :$index="scope.$index"
              />
            </el-form-item>
            <!-- 数字输入框带校验规则 -->
            <!--<el-input-number v-else-if="item.type === 'number'"  v-model="scope.row[item.value]" :precision="2"-->
            <!--:min="item.min || 0" :max="item.max || 99999999"/>-->
            <el-form-item
                v-else-if="item.type === 'number' && scope.$index >= 0"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : numberRules"
            >
              <el-input-number
                  v-model.lazy="scope.row[item.value]"
                  :disabled="item.disabled || false"
                  style="width: 100%; margintop: 18px"
                  controls-position="right"
                  :precision="item.precision || 0"
                  :min="item.min || 0"
                  :step="1"
                  :max="item.max || 9999999"
                  @input="
                changeValidate($event, `data.${scope.$index}[${item.value}]`)
              "
                  @change="
                changeNumber($event, scope.row, scope.$index, item.value)
              "
              />
            </el-form-item>
            <el-input-number
                v-else-if="item.type === 'numberNotRule'"
                v-model.lazy="scope.row[item.value]"
                :disabled="item.disabled || false"
                style="width: 100%"
                controls-position="right"
                :precision="item.precision || 0"
                :min="item.min || 0"
                :step="1"
                :max="item.max || 9999999"
            />
            <!--数字输入qty-->
            <el-form-item
                v-else-if="item.type === 'inputNumber'"
                class="margin-bottom"
            >
              <div class="page-table-input-number-wrapper">
                <div class="page-table-input-number-left">
                  <div class="page-table-input-number-item">
                    <el-form-item
                        v-if="scope.$index >= 0"
                        :prop="`data.${scope.$index}[${item.value}]`"
                        :rules="item.largeRules ? item.largeRules : ''"
                    >
                      <el-input-number
                          v-model.lazy="scope.row[item.largeUnitQty]"
                          style="width: 100%; margintop: 18px"
                          :disabled="item.disabled"
                          clearable
                          controls-position="right"
                          :precision="
                        scope.row.qtyOperateMode === 0 ||
                        scope.row.qtyOperateMode === 2
                          ? 0
                          : systemConfig.qty_show_precision
                      "
                          :min="item.min ? item.min : 0"
                          :max="
                        item.isCalculation
                          ? parseInt(
                              scope.row.needDealCalcQty /
                                scope.row.unitConvertCoefficient
                            )
                          : item.max
                          ? item.max
                          : 999999999999
                      "
                      />
                    </el-form-item>
                    <div
                        v-if="item.showUnitName"
                        class="page-table-input-number-item-unite"
                    >
                      {{ scope.row.unitName }}
                    </div>
                  </div>
                  <div
                      v-if="
                    scope.row.unitConvertCoefficient > 1 &&
                    scope.row.qtyOperateMode === 2
                  "
                      class="page-table-input-number-item"
                  >
                    <el-form-item
                        v-if="scope.$index >= 0"
                        :prop="`data.${scope.$index}[${item.value}]`"
                        :rules="item.smallRules ? item.smallRules : ''"
                    >
                      <el-input-number
                          v-model.lazy="scope.row[item.smallUnitQty]"
                          style="width: 100%; margintop: 18px"
                          :disabled="item.disabled"
                          clearable
                          controls-position="right"
                          :precision="0"
                          :min="item.min ? item.min : 0"
                          :max="
                        item.isCalculation
                          ? parseInt(
                              scope.row[item.smallUnitQty] %
                                scope.row.unitConvertCoefficient
                            )
                          : scope.row.unitConvertCoefficient - 1
                      "
                      />
                    </el-form-item>
                    <div
                        v-if="item.showUnitName"
                        class="page-table-input-number-item-unite"
                    >
                      {{ scope.row.calcUnitName }}
                    </div>
                  </div>
                </div>
                <div
                    v-if="item.showQty && scope.row.unitConvertCoefficient > 1"
                    class="page-table-input-number-right"
                >
                  {{ $fn.qtyFormatter(scope.row[item.value]) }}
                </div>
              </div>
            </el-form-item>
            <el-form-item
                v-else-if="item.type === 'number2' && scope.$index >= 0"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : numberRules"
            >
              <el-input
                  v-model.number.trim="scope.row[item.value]"
                  v-enterNumber
                  type="number"
                  :disabled="scope.row.disabled || false"
                  style="width: 100px; margintop: 18px"
                  :precision="0"
                  :min="item.min || 0"
                  :step="1"
                  :max="item.max || 9999999"
                  @input="(e) => (scope.row[item.value] = validSe(e))"
              />
            </el-form-item>
            <!--金额-->
            <el-form-item
                v-else-if="item.type === 'money' && scope.$index >= 0"
                class="input-money"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : moneyRules"
            >
              <el-input-number
                  v-model.lazy="scope.row[item.value]"
                  type="number"
                  style="minwidth: 100px; width: 100%; margintop: 18px"
                  controls-position="right"
                  :precision="item.precision ? item.precision : 2"
                  :min="item.min || 0"
                  :step="1"
                  :max="item.max || 999999999999999"
                  @change="changePrice(`data.${scope.$index}[${item.value}]`)"
              >
              </el-input-number>
            </el-form-item>
            <!-- 普通输入框 -->
            <el-form-item
                v-else-if="item.type === 'input' && scope.$index >= 0"
                class="input-money"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules"
            >
              <el-input
                v-model.lazy="scope.row[item.value]"
                :maxlength="item.maxlength || 50"
                :disabled="item.disabled || false"
                :placeholder="'请输入' + item.label"
                @input="(e) => (scope.row[item.value] = validSe(e))"
            />
            </el-form-item>
            <!--校验输入框-->
            <el-form-item
                v-else-if="item.type === 'inputRules' && scope.$index >= 0"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : numberRules"
            >
              <el-input
                  v-model.lazy="scope.row[item.value]"
                  style="margintop: 18px"
                  :maxlength="item.maxlength || 50"
                  @input="(e) => (scope.row[item.value] = validSe(e))"
              />
            </el-form-item>
            <!-- 日期选择框 -->
            <el-form-item
                v-else-if="item.type === 'date' && scope.$index >= 0"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
                style="width: 100%"
            >
              <el-date-picker
                  v-model="scope.row[item.value]"
                  :value-format="item.valueFormat ?? 'YYYY-MM-DD'"
                  :picker-options="item.TimePickerOptions"
                  :disabled-date="
                item.TimePickerOptions && item.TimePickerOptions.disabledDate
              "
              />
            </el-form-item>
            <!-- 下拉选择框 -->
            <el-form-item
                v-else-if="item.type === 'select-model' && scope.$index >= 0"
                :prop="`data.${scope.$index}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
            >
              <select-model
                  v-model.lazy="scope.row[item.asValue ? item.asValue : item.value]"
                  style="margintop: 18px"
                  :type-code="item.code"
                  :clearable="item.clearable"
                  :disabled="item.disControl ? item.disControl(scope.row) : item.disabled"
                  :only-show-option="item.onlyShowOption"
                  :check-default="item.checkDefault ? item.checkDefault : false"
                  :multiple="item.multiple"
                  @change="value => item.event && item.event(value, scope.row)"
              />
            </el-form-item>
            <!-- 标签 -->
            <el-tag v-else-if="item.type === 'tag'">{{
                scope.row[item.value]
              }}</el-tag>
            <!-- 图片 -->
            <!-- v-imgAlart -->
            <img
                v-else-if="item.type === 'image' && scope.row[item.value]"
                height="50px"
                :src="scope.row[item.value]"
            />
            <div
                v-else-if="item.type === 'showImage'"
                class="showImage"
                :class="!scope.row[item.value] ? 'bgimg' : ''"
                @click="handleShowImage(scope.row[item.value], item.label)"
            >
              <el-image
                  v-if="scope.row[item.value]"
                  class="image"
                  :src="action + scope.row[item.value]"
              ></el-image>
            </div>
            <!-- 其他 -->
            <span v-else>
            {{
                scope.row[item.value] || scope.row[item.value] === 0
                    ? formatterText(item, scope.row, scope.row[item.value])
                    : scope.row.emptyRowType &&
                    (scope.row.emptyRowType === '1' ||
                        scope.row.emptyRowType === '2')
                        ? ''
                        : '-'
              }}</span
            >
          </template>
          <!-- 其他 -->
          <span v-else>
            {{
              scope.row[item.value] || scope.row[item.value] === 0
                  ? item.formatter ? item.formatter(scope.row) : scope.row[item.value]
                  : scope.row.emptyRowType &&
                  (scope.row.emptyRowType === '1' ||
                      scope.row.emptyRowType === '2')
                      ? ''
                      : '-'
            }}</span
          >
        </template>
        <!--表头提示-->
        <template v-if="item.labelTip" #header>
          <span v-if="item.labelTip"
            >{{ item.label
            }}<el-tooltip placement="top" effect="light">
              <template #content>
                <span v-html="item.labelTip"></span>
              </template>
              <el-icon><QuestionFilled /></el-icon></el-tooltip
          ></span>
        </template>
        <template
          v-if="
            item.type === 'multiHeader' && item.children && item.children.length
          "
          v-slot="scope"
        >
          <el-table-column
            v-for="(childItem, childIndex) in item.children"
            :key="childIndex"
            :formatter="childItem.formatter"
            :prop="childItem.value"
            :label="childItem.label"
            align="center"
            :sortable="childItem.sortable"
            :width="childItem.width"
            :min-width="childItem.minWidth || '85px'"
            show-overflow-tooltip
          >
            <template v-if="childItem.type === 'slot'" v-slot="scope">
              <slot
                :name="'col-' + childItem.value"
                :row="scope.row"
                :$index="scope.$index"
                :column="scope.column"
                :childItem="childItem"
                :childIndex="childIndex"
                :index="index"
              />
            </template>
          </el-table-column>
        </template>
      </el-table-column>
      <el-table-column
        v-if="handle"
        :key="'handle'"
        :fixed="handle.fixed"
        align="center"
        :label="handle.label"
        :width="initWidth"
        class="fix-right-table"
      >
        <template v-slot="scope">
          <div
            class="optionDivPageTable"
            style="white-space: nowrap; display: inline-block"
          >
            <template
                v-if="
                processedHandleLists[scope.$index] &&
                processedHandleLists[scope.$index].length <= 3
              "
            >
              <template
                  v-for="(item, index) in processedHandleLists[scope.$index]"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :title="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    icon="WarningFilled"
                    width="200px"
                    @confirm="item.event(scope.row, scope.$index)"
                >
                  <template #reference>
                      <span class="table-button">
                        {{ item.label }}
                      </span>
                  </template>
                </el-popconfirm>
                <template v-else>
                  <slot
                      v-if="item.slot"
                      :name="'bt-' + item.name"
                      :data="{ item, row: scope.row, $index: scope.$index }"
                  />
                  <span
                      v-else
                      class="table-button"
                      :class="item.label === '删除' ? 'deleteBtn' : ''"
                      @click.stop="item.event(scope.row, scope.$index)"
                  >{{ item.label }}
                  </span>
                </template>
              </template>
            </template>
            <template v-else-if="processedHandleLists[scope.$index]">
              <template
                  v-for="(item, index) in processedHandleLists[
                  scope.$index
                ].slice(0, 2)"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    :title="item.popconfirmText"
                    icon="WarningFilled"
                    @confirm="item.event(scope.row, scope.$index)"
                >
                  <template #reference>
                  <span class="table-button">
                    {{ item.label }}
                  </span>
                  </template>
                </el-popconfirm>
                <span
                    v-else
                    class="table-button"
                    @click="item.event(scope.row, scope.$index)"
                >
                  {{ item.label }}
                </span>
              </template>
              <el-tooltip
                  v-if="processedHandleLists[scope.$index].slice(2).length"
                  :ref="'tooltipDown' + scope.$index"
                  trigger="click"
                  placement="bottom"
                  effect="light"
                  popper-class="tooltipDownBox"
              >
                <template #content>
                  <div
                      v-for="(item, index) in processedHandleLists[
                      scope.$index
                    ].slice(2)"
                      :key="index"
                      @click="hideTooltipDown(scope.$index)"
                  >
                    <div
                        v-if="item.popconfirmText"
                        class="tooltipDownItem"
                        @click="confirmHandle(item, scope)"
                    >
                      {{ item.label }}
                    </div>
                    <div
                        v-else
                        class="tooltipDownItem"
                        @click="item.event(scope.row, scope.$index)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </template>
                <span class="iconfont more tooltipFont">&#xe617;</span>
              </el-tooltip>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <template v-if="pager">
      <div
        v-show="!listInfo.loading"
        class="pagination-container"
        :id="tablePageId"
      >
        <el-pagination
          :background="true"
          v-model:current-page="listInfo.query.pageNo"
          :page-sizes="listInfo.pageSizes"
          :page-size="listInfo.query.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="listInfo.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
    <EleGallery
      v-if="dialogInfo.visible"
      v-model:show-dialog="dialogInfo.visible"
      :file-list="dialogInfo.list"
      :title="dialogInfo.label"
      :multiple-sheets="false"
    />
  </div>
</template>

<script setup name="PageTable">
import SelectModel from '../SelectModel/index'
import EleGallery from '@/components/UploadImg/eleGallery'
import _ from 'lodash'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['handleEvent', 'update:refObj'])
const store = useStore()
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
  },
  treeProps: {
    type: Object,
    default: function () {
      return {};
    },
  },
  // 是否分组查询
  isGroupSearch: {
    type: Boolean,
    default: false,
  },
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  // 刷新
  refresh: {
    type: Number,
  },
  // 获取数据的接口
  api: {
    type: Function,
  },
  // 是否显示序号
  tabIndex: {
    type: Boolean,
    default: false,
  },
  // 是否有选择框
  checkBox: {
    type: Boolean,
    default: true,
  },
  rowKey: {
    type: [String, Function],
    default: function() {
      const array = []
      return function(row) {
        if (array.indexOf(row) === -1) {
          array.push(row)
        }
        return row.id || `__TABLE_ROW__${array.indexOf(row)}`
      }
    },
  },
  // 选中列表
  checkedList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  checkedKey: {
    type: [String, Boolean],
    default: () => {
      return "id";
    },
  },
  checkedRowList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 复选框是否可以勾选回调函数
  selectable: {
    type: Function,
  },
  // 单选行
  highlightRow: {
    type: Boolean,
    default: false,
  },
  // 表格字段配置
  fieldList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 操作栏配置
  handle: {
    type: Object,
  },
  // 是否分页
  pager: {
    type: Boolean,
    default: true,
  },
  // 重置当前页
  initCurpage: {
    type: Number,
  },
  // 查询条件
  query: {
    type: Object,
    default: () => {
      return {};
    },
  },
  // 列表数据
  data: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 监听高度
  listenHeight: {
    type: Boolean,
    default: false,
  },
  loadData: {
    type: Boolean,
    default: true,
  },
  spanMethod: {
    type: Function,
  },
  //是否合计数据
  summary: {
    type: Boolean,
    default: false,
  },
  //合计的字段，为空则合计所有数字字段
  summaryFieldList: {
    type: Array,
    default: function () {
      return [];
    },
  },
  mergeFiled: {
    type: Array,
    default: function () {
      return [];
    },
  },
  mergeData: {
    type: Object,
    default: function () {
      return {};
    },
  },
  mergeMate: {
    type: Array,
    default: () => {
      return [];
    },
  },
  reserveSelection: {
    type: Boolean,
    default: false,
  },
  refObj: {
    type: Object,
  },
  rowClassName: {
    type: Function,
  },
  cellClassName: {
    type: Function,
  },
  tableHeight: {
    type: Number,
  },
  indexMethod: {
    type: Function,
  },
  summariesFn: {
    type: Function,
  },
  isRowClickSelect: {
    type: Boolean,
    default: false,
  },
  isDynamic: {
    type: Boolean,
    default: false,
  },
  methodKey: {
    type: String,
    default: "",
  },
});
const isShowTable = ref(false);
// 列表相关
const listInfo = ref({
  tableHeight: 0, // 表格最大高度
  total: 0, // 总条数
  loading: false, // 加载动画
  pageSizes: [10, 20, 50, 100, 300, 500, 1000], // 分页数量列表
  query: {
    // 查询条件
    pageNo: 1, // 当前页
    pageSize: 20, // 每页条数
  },
});
const afterDynamic = ref(props.isDynamic);
const tableRandom = ref("tableNum" + _.uniqueId());
const numberRules = ref({
  type: "number",
  validator: proxy.$validate.positive,
  trigger: ["blur", "change"],
});
const moneyRules = ref({
  validator: proxy.$validate.positiveMoney,
  trigger: "blur,change",
});
const styleControlInterval = ref(null);
const expands = ref([]);
function formatterText(column, row, val) {
  // 自定义格式化
  if (column.formatter) return column.formatter(row)
  // 数字类型 居右 转换千分位
  if(column.align === "right") return proxy.$fn.TripartiteMethod(val)
  return val
}
const systemConfig = ref(store.state.permission.systemConfig);
const action = ref(axios.defaults.baseURL + "/pub");
const dialogInfo = ref({
  visible: false,
  title: "",
  list: [],
})
const isShowTooltip = ref(false);
const resizeObserver = ref(null);
const resizeObserver1 = ref(null);
watch(
  () => props.initCurpage,
  (val) => {
    listInfo.value.query.pageNo = 1;
  }
);
watch(
  () => props.refresh,
  (val) => {
    if (!props.api) return;
    getList(props.api);
  },
  {
    immediate: false,
  }
);
const isShowRenderHeader = ref(false);
watch(
  () => JSON.parse(JSON.stringify(props.data || [])),
  (newData, oldData = []) => {
    const newDataCopy = proxy.$fn.deepClone(newData);
    const oldDataCopy = proxy.$fn.deepClone(oldData);
    const newDataCopyFilterUuid = newDataCopy.map((item) => {
      delete item.uuid;
      return item;
    });
    const oldDataCopyFilterUuid = oldDataCopy.map((item) => {
      delete item.uuid;
      return item;
    });
    if (
      JSON.stringify(newDataCopyFilterUuid) !=
      JSON.stringify(oldDataCopyFilterUuid)
    ) {
      flexColumnWidth(newData.length);
    }
    emits("update:refObj", proxy.$refs.table);
  },
  {
    immediate: true,
  }
);

const initWidth = ref(120);
function flexColumnWidth(length) {
  if (props.handle && length > 0) {
    proxy.$nextTick(() => {
      setTimeout(() => {
        //查找出操作栏内带class为operation的dom元素
        const operations =
          document.getElementsByClassName("optionDivPageTable");
        if (!operations.length) return;
        let maxValue = 46;
        operations.forEach((item) => {
          if (item.offsetWidth > maxValue) {
            maxValue = item.offsetWidth;
          }
        });
        initWidth.value = maxValue + 26;
      }, 300);
    });
  }
}

watch(
  () => props.checkedRowList,
  (val) => {
    if (val.length) {
      proxy.$nextTick(() => {
        val.forEach((row) => proxy.$refs.table.toggleRowSelection(row, true));
      });
    }
  },
  {
    deep: true, // 深度监听
    immediate: true,
  }
);

function handleSetWidth() {
  resizeObserver1.value = new ResizeObserver((entries) => {
    proxy.$nextTick(() => {
      if (props.handle) {
        setWidth();
      }
    });
  });
  resizeObserver1.value.observe(
    document.getElementsByClassName("set-width-class")[0]
  );
}
function setWidth() {
  const operations = document.getElementsByClassName("optionDivPageTable");
  // console.log(operations)
  if (!operations.length) return;
  let maxValue = 46;
  operations.forEach((item) => {
    if (item.offsetWidth > maxValue) {
      maxValue = item.offsetWidth;
    }
  });
  console.log(maxValue, 1);
  initWidth.value = maxValue + 26;
}

const tableContainerHeight = ref(230);
const topHeight = ref("");
const tableId = ref(`page-table-container-height-${_.uniqueId()}`);
const tablePageId = ref(`page-table-container-page-${_.uniqueId()}`);

watch(
  () => proxy.$store.state.app.pageTableHeightStatus,
  () => {
    setStyle();
  }
)

// 处理设置表格自适应样式
function handelStyle() {

  resizeObserver.value = new ResizeObserver((entries) => {
    proxy.$nextTick(() => {
      setStyle()
    })
  })
  resizeObserver.value.observe(
    document.getElementById('fundBox')
  )
  // setStyle()
  // window.onresize = () => {
  //   setStyle()
  // }
}

// 计算表格自适应高度
function setStyle() {
  if (!afterDynamic.value) {
    isShowTable.value = true;
    return;
  }
  setTimeout(() => {
    isShowTable.value = true;
    topHeight.value =
      document.getElementById(tableId.value)?.getBoundingClientRect().top || 0;
    let pageHeight =
      document.getElementById(tablePageId.value)?.offsetHeight || 0;
    if (!topHeight.value) {
      return;
    }
    // if (document.body.clientHeight - topHeight.value - pageHeight - 6 < 190) {
    //   afterDynamic.value = false
    //   return
    // }
    tableContainerHeight.value =
      document.body.clientHeight - topHeight.value - pageHeight - 6
    if (tableContainerHeight.value < 190) {
      tableContainerHeight.value = 230;
    }
  }, 200);
}

function changeValidate(value, str) {
  emits("changeValidate", str);
}
function hideTooltipDown(index) {
  proxy.$refs['tooltipDown' + index].hide()
}
function confirmHandle(item, scope) {
  ElMessageBox.confirm(item.popconfirmText, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      item.event(scope.row, scope.$index);
    })
    .catch((e) => {});
}
function handleShowImage(url, label) {
  //查看图片
  if (!url) return;
  dialogInfo.value.visible = true;
  dialogInfo.value.list = [
    {
      name: url,
      url: action.value + url,
      uid: new Date().getTime() + (1 + Math.random()),
    },
  ];
  dialogInfo.value.label = label;
}
// 处理参数
function handleParams() {
  const obj = {};
  for (const key in props.query) {
    if (
      props.query[key] ||
      props.query[key] === 0 ||
      props.query[key] === false
    ) {
      obj[key] = proxy.$fn.isString(props.query[key])
        ? proxy.$fn.setTrim(props.query[key])
        : proxy.$fn.setTrimObj(props.query[key], key);
      if (
        key === "queryDtoList" &&
        props.query.queryDtoList &&
        props.query.queryDtoList.length
      ) {
        obj.queryMap = {};
      }
    }
  }
  // 如果不需要分页，则无分页相关参数
  return props.pager ? { ...listInfo.value.query, ...obj, curPage: listInfo.value.query.pageNo } : obj
}
//右侧图表页面改变
function resizeFixedRight() {
  let body =
    document.getElementsByClassName(`${tableRandom.value}`)[0] || undefined;
  if (body) {
    let body_wrapper = body.getElementsByClassName("el-table__body-wrapper")[0];
    if (body_wrapper) {
      let header = body.getElementsByClassName("el-table__header-wrapper")[0]; //Tableheader高度
      let headerHeight = header ? header.offsetHeight : 0; //Tableheader高度
      let rightFixed = body.getElementsByClassName("el-table__fixed-right")[0];
      let leftFixed = body.getElementsByClassName("el-table__fixed")[0];
      if (rightFixed) {
        let fixedFooterright = rightFixed.getElementsByClassName(
          "el-table__fixed-footer-wrapper"
        )[0];
        rightFixed.style.height =
          (fixedFooterright
            ? fixedFooterright.offsetHeight + body_wrapper.scrollHeight
            : body_wrapper.scrollHeight) +
          headerHeight +
          "px";
      }
      if (leftFixed) {
        let fixedFooterleft = leftFixed.getElementsByClassName(
          "el-table__fixed-footer-wrapper"
        )[0];
        leftFixed.style.height =
          (fixedFooterleft
            ? fixedFooterleft.offsetHeight + body_wrapper.scrollHeight
            : body_wrapper.scrollHeight) +
          headerHeight +
          "px";
      }
    }
  }
}
function getAddLisy(row) {
  if (props.isRowClickSelect) {
    emits("handleEvent", "tableCheckRadio", row);
  }
  if (!props.isRowClickSelect || !props.checkBox) return;
  if (!row.disabled) {
    proxy.$refs.table.toggleRowSelection(row);
  } else {
    console.log("已添加了");
  }
}
// 得到数据
function getList(api) {
  // listInfo.value.loading = true
  expands.value = [];
  return new Promise((resolve, reject) => {
    // 每次调用接口时都自动绑定最新的数据
    api(handleParams())
      .then((res) => {
        // listInfo.value.loading = false
        if (res.success) {
          // 使外面可以访问到表格数据
          const arr = Array.isArray(res.data) ? res.data : res.data.result;
          const _arr = arr.map((it) => {
            return {
              ...it,
              _checked: false,
            };
          });
          //发货单详情使用合并,根据productId大小排序
          if (!props.spanMethod) {
            let spanArr = _arr.concat([]);
            spanArr.sort(compare("productId"));
            emits("update:data", spanArr);
          } else {
            emits("update:data", _arr);
          }

          // emits("update:data", _arr);
          if (props.pager) {
            listInfo.value.total = res.total
            listInfo.value.query.pageNo = res.pageNo - 0
            listInfo.value.query.pageSize = res.pageSize - 0
            emits('pageInfo', {
              total: listInfo.value.total,
              pageNo: listInfo.value.query.pageNo,
              pageSize: listInfo.value.query.pageSize,
            });
            if (!res.data.length && res.pageNo > 1) {
              if (res.pageNo > res.totalPages) {
                listInfo.value.query.pageNo = res.totalPages
              } else {
                listInfo.value.query.pageNo = res.pageNo - 1
              }
              getList(api);
            }
          }
          // 设置当前选中项
          if (props.checkedKey) {
            const rows =
              arr.filter(
                (row) =>
                  props.checkedList.includes(row[props.checkedKey]) ||
                  row.disabled
              ) || [];
            if (rows.length) {
              proxy.$nextTick(() => {
                rows.forEach((row) =>
                  proxy.$refs.table.toggleRowSelection(row, true)
                );
              });
            }
          }
          resolve(res);
          emits("handleEvent", "list", arr);
        } else {
          // proxy.$message({
          //   showClose: true,
          //   message: res.message,
          //   type: "error",
          //   duration: 3500
          // });
          reject();
        }
      })
      .catch(() => {
        reject();
        // listInfo.value.loading = false
      });
  });
}
function handleSizeChange(val) {
  const query = listInfo.value.query
  query.pageSize = val // 每页条数
  query.pageNo = 1 // 每页条数切换，重置当前页
  getList(props.api)
}
function handleCurrentChange(val) {
  listInfo.value.query.pageNo = val // 当前页
  getList(props.api)
}
// // 派发按钮点击事件
// handleClick(event, data) {
//     emits('handleClick', event, data)
// },
// 选中数组
const multipleSelection = ref([]);
//  选中单号存放
const radios = ref([]);
function onSelectAll(selection) {
  proxy.$nextTick(() => {
    let isAll = !!selection.length;
    let _rows = props.data.map((it) => {
      return {
        ...it,
        _checked: isAll,
      };
    });
    let checkedData = selection.map((it) => {
      return {
        ...it,
        _checked: isAll,
      };
    });
    emits("handleEvent", "selectCheck", checkedData, _rows);
  });
  multipleSelection.value = selection;
}

function onSelect(selection, row) {
  let _rows = [];
  let _data = [];
  let _row = row;
  let idx = _.findIndex(props.data, { [props.rowKey]: row[props.rowKey] });
  if (idx !== -1) {
    if (!row._checked) {
      _rows = selection.map((it) => {
        return {
          ...it,
          _checked: true,
        };
      });
      _row._checked = true;
      props.data[idx]._checked = true;
    } else {
      _row._checked = false;
      _rows = [...selection];
      props.data[idx]._checked = false;
    }
  }
  _data = [...props.data];
  if (!props.methodKey) {
    emits("handleEvent", "selectCheck", _rows, _data, _row);
    return;
  }
  // 取消其中一个选中的时候 默认取消同单号的选中
  if (!selection.includes(row)) {
    pickUp(false, row[props.methodKey]);
  } else {
    pickUp(true, row[props.methodKey]);
  }
  emits("handleEvent", "selectCheck", _rows, _data, _row);
}
// 需要默认勾选/取消的数据
function pickUp(bool, groupKey) {
  let arr = [];
  if (!bool) {
    multipleSelection.value.forEach((item) => {
      if (item[props.methodKey] === groupKey) {
        arr.push(item);
      }
    });
  }
  toggleSelection(arr, bool);
}
// 默认选择/取消中的行
function toggleSelection(rows, bool) {
  if (rows) {
    proxy.$nextTick(() => {
      rows.forEach((row) => {
        proxy.$refs.table.toggleRowSelection(row, bool);
      });
    });
  } else {
    proxy.$refs.table.clearSelection();
  }
}
function handleSelectionChange(rows) {
  emits("handleEvent", "tableCheck", rows);
}
// 选中行
function clickRow(row) {
  if (props.highlightRow) {
    emits("handleEvent", "tableClickRow", row);
  } else {
    return;
  }
}
//合计数据
function getSummaries({ columns, data }) {
  const sums = [];
  const sumsAll = [];
  if (props.summaryFieldList.length === 0) return sums;
  columns.forEach((column, index) => {
    let arrIndex = -1;
    let priceIndex = -1;
    if (typeof props.summaryFieldList[0] === "string") {
      arrIndex = _.findIndex(props.summaryFieldList, column.property);
    } else if (typeof props.summaryFieldList[0] === "object") {
      arrIndex = _.findIndex(props.summaryFieldList, function (o) {
        if (o.value === column.property && o.show === "false") {
          priceIndex = index;
        }
        return o.value === column.property;
      });
    }
    if (arrIndex !== -1) {
      const values = data.map((item) => Number(item[column.property]));
      let formatter = props.summaryFieldList[arrIndex].formatter || "";
      let label = props.summaryFieldList[arrIndex].label || "";
      if (!values.every((value) => isNaN(value))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            return proxy.$fn.accAdd(prev, curr)
          } else {
            return prev;
          }
        }, 0);
        if (formatter) {
          sums[index] = formatter(sums[index]);
        }
        if (label) {
          sumsAll[index] = label + "：" + sums[index];
        }
      } else {
        sums[index] = "";
        if (label) {
          sumsAll[index] = "";
        }
      }
    }
    if (priceIndex != -1) {
      sums[priceIndex] = "";
    }
  });
  if (props.checkBox) {
    sums[1] = "合计";
  } else {
    sums[0] = "合计";
  }
  if (sumsAll.length) {
    emits("callbackSum", sumsAll);
  }
  return sums;
}
function compare(property) {
  return function (a, b) {
    return a[property] - b[property];
  };
}
function defaultSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (props.spanMethod) {
    return props.spanMethod({ row, column, rowIndex, columnIndex });
  } else {
    if (props.mergeFiled.length === 0) {
      return [1, 1];
    }
    if (props.mergeFiled.includes(column.property)) {
      let str = row.productId;
      if (props.mergeMate.length) {
        props.mergeMate.forEach((el) => {
          str = str + "" + row[el];
        });
      }
      const detailCellsMergeData = props.mergeData[str];
      if (detailCellsMergeData) {
        if (rowIndex === detailCellsMergeData.startIndex) {
          return {
            rowspan: detailCellsMergeData.rowspan,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    }
  }
}
// handleShow() {
//     if(!props.handle){
//         return false;
//     }
//     const filter = props.handle.btList.filter(item => item.show && !item.ifRender);
//     return filter.length !== 0;
// },
// 根据页面的头部, 功能框, 分页组件等高度，计算出table的高度
function getTableHeight() {
  // 当表格存在的时候才执行操作
  if (document.getElementsByClassName("el-table").length === 0) {
    return;
  }
  if (document.getElementsByClassName("app-container").length === 0) {
    return;
  }
  const boxH = document.getElementsByClassName("app-container")[0].clientHeight;
  // const navH = document.getElementsByClassName('navbar-container')[0] ? document.getElementsByClassName('navbar-container')[0].clientHeight : 0
  // const tagH = document.getElementsByClassName('tags-view-container')[0] ? document.getElementsByClassName('tags-view-container')[0].clientHeight : 0
  const searchH = document.getElementsByClassName("page-filter")[0]
    ? document.getElementsByClassName("page-filter")[0].clientHeight
    : 0;
  const pagerH = document.getElementsByClassName("pagination-container")[0] || {
    clientHeight: 0,
  };
  const bottomH = pagerH.clientHeight ? pagerH.clientHeight : 0;
  // const tab = document.getElementsByClassName('el-table')[0] || { offsetTop: 0 }
  // const tabOffT = tab.offsetTop
  // 表格的高度 = 视口高度 - 表格到头部导航的距离 - 头部导航的高度137 - 分页组件的高度100 - 分页组件
  // document.getElementsByClassName('el-table')[0].style.height = (boxH - 40 - searchH - bottomH) + 'px'
  // console.log('表格最大高度为:' + (boxH - navH - tagH - searchH - bottomH))
  return boxH - searchH - bottomH - 40;
}
function exChange(data, expandedRows, expanded) {
  expands.value = expandedRows.length ? [data[props.rowKey]] : []
  emits('exChange', data, expandedRows, expanded)
}
function sortChange(column, prop, order) {
  emits('sortChange', column, prop, order)
}
function rowDblclick(row) {
  emits('rowDblclick', row)
}

// 将 getHanleList 转换为接收参数并返回处理后数据的纯函数
const processHandleList = (list, rowData) => {
  if (!list || !list.length) return [];
  let newList = list.filter((item) => {
    let isShow = item.show && (!item.ifRender || item.ifRender(rowData));
    return isShow;
  });
  // 根据按钮权重排序
  return newList;
};
// 在模板中使用计算属性替代方法调用
const processedHandleLists = computed(() => {
  // 这里我们创建一个映射来存储每行数据的处理结果
  const result = {};
  if (props.handle && props.handle.btList && props.data) {
    props.data.forEach((row, index) => {
      result[index] = processHandleList(props.handle.btList, row);
    });
  }
  return result;
});
function getHanleList(list, scope, str = "") {
  if (list.length) {
    let newList = list.filter((item, index) => {
      return (
        (item.show && (!item.ifRender || item.ifRender(scope.row))) || item.slot
      )
    })
    if (str === 'more') {
      return newList.slice(1, newList.length)
    } else {
      return newList
    }
  } else {
    return []
  }
}
function changePrice(str) {
  emits('handleEvent', 'changePrice', str)
}
function setCurrentRow(row, target) {
  proxy.$refs.table.toggleRowSelection(row, target)
}
function clearSelection() {
  proxy.$refs.table.clearSelection()
}
function changeNumber(e, row, index, str) {
  emits('handleEvent', 'changeNumber', e, row, index, str)
}
function onMouseOverTable(refName) {
  let parentWidth = proxy.$refs['parent' + refName][0].offsetWidth
  let contentWidth = proxy.$refs[refName][0].offsetWidth
  // 判断是否开启tooltip功能
  if (contentWidth > parentWidth) {
    isShowTooltip.value = false
  } else {
    isShowTooltip.value = true
  }
}

onMounted(() => {
  handelStyle()
  handleSetWidth()
})

onActivated(() => {
  handelStyle()
  handleSetWidth()
})

onUpdated(() => {
  // <!-- handelStyle() -->
  handleSetWidth()
})

onUnmounted(() => {
  if (styleControlInterval.value) {
    clearInterval(styleControlInterval.value)
  }
})
function clearTableSort() {
  proxy.$refs.table.clearSort()
}

defineExpose({
  setCurrentRow,
  clickRow,
  setStyle,
  clearSelection,
  clearTableSort
})
</script>

<style lang="scss" scoped>
/* :deep(.el-table) {
  th {
    .cell {
      white-space: nowrap !important;
      text-overflow: ellipsis;
      word-break: break-all;
    }
  }
}
.value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
} */
.page-table {
  height: 100%;
  .pagination-container {
    padding: 15px 0;
  }

  :deep(.el-table .cell.el-tooltip .el-checkbox) {
    margin-left: auto;
    margin-right: auto;
  }
  // :deep(.el-table-fixed-column--right) {
  //   min-width: 68px;
  //   display: block;
  // }
}
.el-dropdown-menu--mini .el-dropdown-menu__item {
  padding: 0;
}
.showImage {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  .image {
    max-width: 40px !important;
    max-height: 40px !important;
  }
}
.bgimg {
  background-image: url(../../assets/image/no-img.png);
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position: 50% 50%;
}
</style>
