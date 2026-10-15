import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  // return Cookies.get(TokenKey)
  const roleDataToken = localStorage.getItem('userInfoStore')
    ? JSON.parse(localStorage.getItem('userInfoStore')).userAndPermissionInfo
        ?.userInfoDTO?.token
    : Cookies.get(TokenKey)
  const wujieToken = window.$wujie?.props?.userInfo.token
    ? window.$wujie?.props?.userInfo.token
    : Cookies.get(TokenKey)
  return roleDataToken || wujieToken
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
