export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
}

class StorageManager {
    constructor() {
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability()
    }

    checkLocalStorageAvailability() {
        try {
            const test = 'test'
            localStorage.setItem(test, test)
            localStorage.removeItem(test)
            return true
        } catch (e) {
            return false
        }
    }

    getStorage(persistent = true) {
        if (!this.isLocalStorageAvailable) return null
        return persistent ? localStorage : sessionStorage
    }

    setToken(token, persistent = true) {
        const storage = this.getStorage(persistent)
        if (!storage) return

        storage.setItem(STORAGE_KEYS.TOKEN, token)
    }

    getToken() {
        if (!this.isLocalStorageAvailable) return null

        return (
            localStorage.getItem(STORAGE_KEYS.TOKEN) ||
            sessionStorage.getItem(STORAGE_KEYS.TOKEN)
        )
    }

    setUser(userData, persistent = true) {
        const storage = this.getStorage(persistent)
        if (!storage) return

        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    }

    getUser() {
        if (!this.isLocalStorageAvailable) return null

        const userData =
            localStorage.getItem(STORAGE_KEYS.USER) ||
            sessionStorage.getItem(STORAGE_KEYS.USER)

        try {
            return userData ? JSON.parse(userData) : null
        } catch (error) {
            console.error('Error parsing user data from storage:', error)
            return null
        }
    }

    clearAuth() {
        if (!this.isLocalStorageAvailable) return

        ;[localStorage, sessionStorage].forEach((storage) => {
            Object.values(STORAGE_KEYS).forEach((key) => {
                storage.removeItem(key)
            })
        })
    }
}

export const storageManager = new StorageManager();
