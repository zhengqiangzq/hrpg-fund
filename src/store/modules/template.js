const ureportURL = import.meta.env.VITE_APP_UREPORT_URL
const ureport = {
  state: {
    //ureportUrl: ureportURL + '/ureport/designer',
    ureportUrl: null,
    iframeName: [],
    freashIframe: null,
    isOpenIframePage: null,
  },

  mutations: {
    SET_UREPORT_URL: (state, url) => {
      state.ureportUrl = ureportURL + url
    },
    SET_IFRAMENAME: (state, data) => {
      state.iframeName = data
    },
    FREASHIFRAME: (state, data) => {
      state.freashIframe = data
    },
    ISOPENIFRAMEPAGE: (state, data) => {
      state.isOpenIframePage = data
    },
  },
}

export default ureport
