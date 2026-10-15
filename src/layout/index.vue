<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="
        $store.state.app.device === 'mobile' && $store.state.app.sidebar?.opened
      "
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <div
      :class="{ hasTagsView: $store.state.settings.tagsView }"
      class="main-container"
      :style="{
        marginLeft: BYWUJIE ? '0' : '190px',
      }"
    >
      <app-main/>
    </div>
  </div>
</template>
<script setup name="Layout">
import {AppMain} from './components'
import {useRoute} from 'vue-router'

const $router = useRoute()
const WIDTH = 992
const {body} = document
const {proxy} = getCurrentInstance()
const classObj = computed(() => {
  return {
    hideSidebar: !proxy.$store.state.app.sidebar?.opened,
    openSidebar: proxy.$store.state.app.sidebar?.opened,
    withoutAnimation: proxy.$store.state.app.sidebar?.withoutAnimation,
    mobile: proxy.$store.state.app.device === 'mobile',
  }
})
const BYWUJIE = ref(window.__POWERED_BY_WUJIE__)
watch(
  () => $router,
  () => {
    if (
      proxy.$store.state.app.device === 'mobile' &&
      proxy.$store.state.app.sidebar?.opened
    ) {
      proxy.$store.dispatch('app/closeSideBar', {withoutAnimation: false})
    }
  }
)

onBeforeMount(() => {
  window.addEventListener('resize', $_resizeHandler)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', $_resizeHandler)
})
onMounted(() => {
  const isMobile = $_isMobile()
  if (isMobile) {
    proxy.$store.dispatch('app/toggleDevice', 'mobile')
    proxy.$store.dispatch('app/closeSideBar', {withoutAnimation: true})
  }
})

const $_isMobile = () => {
  const rect = body.getBoundingClientRect()
  return rect.width - 1 < WIDTH
}
const $_resizeHandler = () => {
  if (!document.hidden) {
    const isMobile = $_isMobile()
    proxy.$store.dispatch('app/toggleDevice', isMobile ? 'mobile' : 'desktop')

    if (isMobile) {
      proxy.$store.dispatch('app/closeSideBar', {withoutAnimation: true})
    }
  }
}
const handleClickOutside = () => {
  proxy.$store.dispatch('app/toggleSideBar')
}
</script>
<style scoped lang="scss">
@import '@/styles/mixin.scss';
@import '@/styles/variables.scss';

.tags-view-container {
  height: 30px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;

      &:first-of-type {
        margin-left: 15px;
      }

      &:last-of-type {
        margin-right: 15px;
      }

      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;

        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }

  .fixIcon {
    position: fixed;
    z-index: 1000;
    right: 40px;
    bottom: 50px;
    height: 36px;
    width: 66px;
    border-radius: 18px;
    background-color: rgba(247, 148, 148, 0.2);
    cursor: pointer;
    color: #f46f6f;

    .numIcon {
      .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 22px;
        font-weight: 700;
      }

      .num {
        position: absolute;
        width: 26px;
        right: 0;
        top: 0px;
        font-size: 14px;
      }
    }
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
