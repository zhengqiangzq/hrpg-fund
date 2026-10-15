import DownloadLog from './index.vue';
import {getCurrentInstance, h, render} from "vue";

export function useDownloadLog(businessTypeCode, title) {
    const { proxy, appContext } = getCurrentInstance()
    function openDownloadLog() {
        const div = document.createElement('div');
        div.className = 'download-log-container app-container view-fill';
        div.style = 'position: absolute; top: 0; left: 0; z-index: 999;'
        let el = proxy.$el
        if (!el.className.includes('app-container')) {
            el = el.querySelector('.app-container');
        }
        el.appendChild(div);

        const vDownloadLog = h(DownloadLog, {
            visible: true,
            title,
            businessTypeCode,
            'onUpdate:visible'() {
                render(null, div)
                div.remove()
            }
        })
        vDownloadLog.appContext = appContext
        render(vDownloadLog, div)
    }

    return {
        openDownloadLog
    }
}