import {computed, getCurrentInstance, watchEffect} from "vue";
import {useStore} from "vuex";

/**
 * 使用无界跳转页面
 * @param pageUrl 当前页面链接
 * @param toPageBefore 跳转页面前
 * @param toPageIndex 跳转首页处理方法
 * @param toPageOther 跳转其他页面处理方法
 * @param start 直接启动
 * @returns {{startToPageListener: startToPageListener, turnMessagePage: turnMessagePage}}
 */
export function useWujieTurnPage({
                                     pageUrl,
                                     toPageBefore,
                                     toPageIndex,
                                     toPageOther,
                                     start
                                 } = {}) {

    const { proxy } = getCurrentInstance()

    /**
     * 开启页面监听
     */
    function startToPageListener() {
        const store = useStore()
        const toPage = computed(() => store.state.settings.toPage)
        watchEffect(() => {
            const val = toPage.value
            if (val && JSON.stringify(val) !== '{}' &&
                val['url'].includes(pageUrl)) {
                proxy.$fn.throttle(toPageFunc, val, 10)
            }
        })
    }

    function toPageFunc(val) {
        toPageBefore && toPageBefore(val)
        if (!val.urlType || val.urlType === 'index') {
            toPageIndex && toPageIndex(val)
        } else {
            proxy.$nextTick(() => {
                toPageOther && toPageOther(val)
                sessionStorage.setItem('storeRowId', val.businessId)
            })
        }
        proxy.$store.dispatch('settings/toPage', '')
    }

    /**
     * 跳转页面
     * @param info
     */
    function turnMessagePage(info) {
        window.$wujie?.bus.$emit('turnMessagePage', info)
    }

    if (start) {
        startToPageListener()
    }

    return {
        startToPageListener,
        turnMessagePage
    }
}