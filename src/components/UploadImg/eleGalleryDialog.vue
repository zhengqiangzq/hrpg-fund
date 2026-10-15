<template>
  <el-dialog draggable v-model="isShowPreview" append-to-body :show-close="false" width="1200px" class="dialog-image">
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
        <div>
          <span class="btn primaryBtn" @click="downLoad">
            下载
          </span>
          <span class="btn defaultBtn" @click="handleClose">
            关闭
          </span>
        </div>
      </div>
    </template>
    <template v-if="pdfFileType.includes(typeSource) || typeSource === 'doc' || typeSource === 'docx'">
      <div class="pdf-wrap">
        <iframe
            v-if="iframeSrc"
            :src="iframeSrc"
            frameborder="0"
            class="pdf-iframe"
            ref="pdfIframeRef"
        ></iframe>
      </div>
    </template>
    <template v-if="excelFileType.includes(typeSource) && showExcelComponent">
      <div>
        <vue-office-excel
            :src="sources"
            style="height: calc(50vh);"
            :options="{ xls: true }"
            @rendered="handleRendered"
            @error="handleError"
        />
      </div>
    </template>

    <template v-if="imageFileType.includes(typeSource)">
      <!-- 单张图片 -->
      <div class="ele-gallery-image-wrapper">
        <el-image
            :src.lazy="sources"
            class="ele-gallery-image"
        />
      </div>
    </template>
    <template v-if="videoType.includes(typeSource)">
      <!-- 单张图片 -->
      <div class="ele-gallery-image-wrapper">
        <audio
            :style="{
              width: '250px',
            }"
            controls="controls"
            :src="sources"
        >
          您的浏览器不支持音频播放
        </audio>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="eleGalleryDialog">
//RO00000000035
import { ElLoading } from 'element-plus'
import { exportExcel, getDocIsPdfUrl } from "@/api/pub.js"
import * as XLSX from 'xlsx';
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const isShowPreview = ref(false)
const title = ref('')
const sources = ref('')
const typeSource = ref('')
const imageFileType = ref(['png', 'jpg', 'jpeg', 'gif', 'ico', 'bmp', 'webp'])
const videoType = ref(['mp3', 'm4a', 'aac', 'wav', 'audio', 'x-m4a'])
const pdfFileType = ref(['pdf'])
const docFileType = ref(['doc', 'docx'])
const excelFileType = ref(['xlsx', 'xls'])
const url = ref('')
// 条件渲染标志
const showExcelComponent = ref(false);
// 延迟加载组件
let VueOfficeExcel = shallowRef(null)
// iframe 源地址
const iframeSrc = ref('')
const action = ref(import.meta.env.VITE_APP_FILE_URL)
const viewerBase = ref('pdfjs/web/viewer.html');

// 组件卸载时清理状态
onUnmounted(() => {
  showExcelComponent.value = false;
});
/**
 * 临时解决方案，解决docx文件在预览时空白问题
 * https://github.com/501351981/vue-office/issues/116
 */
window.setImmediate = cb => setTimeout(cb, 0)
// 按需加载 VueOffice 组件
const loadVueOfficeExcel = async () => {
  if (!VueOfficeExcel.value) {
    const componentModule = await import('@vue-office/excel');
    VueOfficeExcel.value = componentModule.default;
    // 导入样式
    await import('@vue-office/excel/lib/index.css');
    // 确保组件已加载后再显示
    showExcelComponent.value = true;
  } else {
    showExcelComponent.value = true;
  }
};

/**
 * 预处理 Excel 文件，将日期序列号转换为格式化日期字符串
 * 解决 vue-office-excel 中日期显示为小数的问题
 */
const preprocessExcelDates = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          if (!cell) continue;
          console.log(cell)
          if (cell.t === 'd' && cell.v instanceof Date && !isNaN(cell.v)) {
            // 规则1：t==='d' 时，若 cell.w 是时分秒或中文日期格式，直接展示 cell.w
            if (isTimeString(cell.w) || isChineseDateFormat(cell.w)) {
              cell.t = 's';
              cell.v = cell.w;
              cell.w = cell.w;
            } else {
              // 否则转换 cell.v（Date 对象）为标准格式
              const formatted = formatDate(cell.v);
              cell.t = 's';
              cell.v = formatted;
              cell.w = formatted;
            }
          } else if (cell.t === 'n' && typeof cell.v === 'number' && isShortDate(cell.w)) {
            // 规则2：t==='n' 时，若 cell.w 是短日期格式（如 6/20/26、8/30/26），统一转为 YYYY-MM-DD
            const formatted = shortDateToYMD(cell.w);
            cell.t = 's';
            cell.v = formatted;
            cell.w = formatted;
          }
        }
      }
    });

    const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return output;
  } catch (error) {
    console.error('预处理 Excel 日期失败:', error);
    return fileUrl;
  }
};

/** 判断是否为纯时间字符串，如 "13:33:21" */
const isTimeString = (str) => {
  if (typeof str !== 'string') return false;
  return /^\d{1,2}:\d{2}:\d{2}$/.test(str.trim());
};

/** 判断是否为中文日期格式，如 "2026年6月13日" */
const isChineseDateFormat = (str) => {
  if (typeof str !== 'string') return false;
  return /^\d{4}年\d{1,2}月\d{1,2}日/.test(str.trim());
};

/** 判断是否为短日期格式，如 "6/20/26"、"8/30/26"、"12/31/99" */
const isShortDate = (str) => {
  if (typeof str !== 'string') return false;
  return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str.trim());
};

/** 将短日期 "M/D/YY" 转为 "YYYY-MM-DD" 格式 */
const shortDateToYMD = (str) => {
  const parts = str.trim().split('/');
  let month = String(parts[0]).padStart(2, '0');
  let day = String(parts[1]).padStart(2, '0');
  let year = parseInt(parts[2]);
  // 两位年份：00-49 → 20xx，50-99 → 19xx
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }
  return `${year}年${month}月${day}日`;
};

/** 格式化日期为 yyyy-MM-dd HH:mm:ss 形式，若时间部分为 00:00:00 则只返回日期部分 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const dateStr = `${year}-${month}-${day}`;
  if (hours === 0 && minutes === 0 && seconds === 0) {
    return dateStr;
  }
  return `${dateStr} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
async function startPreview(thumb, name, type, uri) {
  url.value = uri
  title.value = name || '附件'
  typeSource.value = type
  if (type === 'pdf') {
    // 构造 iframe src
    // 重要：file 参数必须编码，且如果是跨域或特定服务器路径，需确保 PDF 服务允许 CORS
    const encodedSrc = encodeURIComponent(thumb);
    iframeSrc.value = `${action.value}/app/${viewerBase.value}?file=${encodedSrc}`;
    sources.value = thumb;
  }
  // 根据文件类型决定是否加载对应组件
  if (excelFileType.value.includes(type)) {
    // Excel 文件：先预处理日期格式，再渲染
    const processedBuffer = await preprocessExcelDates(thumb);
    sources.value = processedBuffer;
    loadVueOfficeExcel();
  }
  //doc和docx
  else if (docFileType.value.includes(type)) {
    sources.value = thumb;
    docTransToPDF();
  } else {
    proxy.$nextTick(() => {
      sources.value = thumb;
    })
  }
  isShowPreview.value = true
}
// doc,docx转pdf预览
function docTransToPDF() {
  getDocIsPdfUrl(url.value).then((res) => {
    if (res.code === 200) {
      // 构造 iframe src
      // 重要：file 参数必须编码，且如果是跨域或特定服务器路径，需确保 PDF 服务允许 CORS
      let _src = import.meta.env.VITE_APP_BASIC_API + res.data;
      const encodedSrc = encodeURIComponent(_src);
      iframeSrc.value = `${action.value}/app/${viewerBase.value}?file=${encodedSrc}`;
      console.log(iframeSrc.value)
    }
  });
}
const handleRendered = () => {
  console.log('文档渲染完成')
}
const handleError = (e) => {
  console.error('渲染失败', e)
}
function downLoad(){
  exportExcel({ fileName: url.value }).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res, title.value, '')
    }
  })
}
function handleClose(){
  isShowPreview.value = false
  sources.value = ''
  // 清空 src 以停止加载和释放内存
  iframeSrc.value = ''
  emits('close')
}

defineExpose({
  startPreview
})
</script>

<style scoped lang="scss">
.ele-gallery-image-wrapper{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;

}
.ele-gallery-image {
  max-width: 100%;
  height: 700px !important;
}
.el-carousel__item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-wrap {
  margin: 0 auto;
  height: 700px;
}
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
.my-header{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btn {
    background-color: #f5faff;
    color: #333;
    border: 1px solid #d5d7da;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 28px;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .primaryBtn {
    background-color: #165dff;
    color: #fff;
    border: 1px solid #165dff;
    cursor: pointer;
    margin-right: 12px;
  }
  .primaryBtn:hover {
    background-color: #2e90fa;
    border: 1px solid #2e90fa;
  }
}
.controls{
  padding-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
}
.toolbar{
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  .scaleBox{
    padding: 0 15px;
    box-sizing: border-box;
    font-size: 16px;
  }
  .toolbar-line{
    width: 1px;
    height: 24px;
    background-color: #7f7d7d;
    margin: 0 10px;
  }
}
</style>
<style lang="scss">
.dialog-image{
  padding-bottom: 24px;
  box-sizing: border-box;
  .ele-gallery-image-wrapper{
    .el-image{
      .el-image__inner{
        max-height: 700px !important;
      }
    }
  }

}
.docx-container-wrapper{
  height: 700px;
  max-width: calc(100%);
  overflow: hidden;
  overflow-y: scroll;
  .docx-content{
    padding: 22px !important;
    box-sizing: border-box;
  }
}
/* 全局样式重置 */
.docx-container :deep(.docx-content) {
  * {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }

  table, td, th {
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    background: transparent !important;
  }

  /* 清除伪元素线条 */
  ::before, ::after {
    content: none !important;
  }
}
</style>
