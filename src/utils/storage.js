const getStorageMethods = storageType => {
	const storage = storageType === 'Local' ? window.localStorage : window.sessionStorage

	return {
		set(key, val) {
			storage.setItem(key, JSON.stringify(val))
		},
		// 获取永久缓存
		get(key) {
			const json = storage.getItem(key)
			return json ? JSON.parse(json) : json
		},
		has(key) {
			return !!storage.getItem(key)
		},
		// 移除永久缓存
		remove(key) {
			storage.removeItem(key)
		},
		// 移除全部永久缓存
		clear() {
			let realSubSystemDTOS = localStorage.getItem('realSubSystemDTOS')
			storage.clear()
			if (
				realSubSystemDTOS &&
				realSubSystemDTOS != null &&
				realSubSystemDTOS != '' &&
				realSubSystemDTOS != undefined &&
				realSubSystemDTOS != 'null' &&
				realSubSystemDTOS != 'undefined'
			) {
				localStorage.setItem('realSubSystemDTOS', realSubSystemDTOS)
			}
		},
	}
}
export const Local = getStorageMethods('Local')

export const Session = getStorageMethods('Session')
