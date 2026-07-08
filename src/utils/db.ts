const DB_NAME = 'fitforge-admin'
const DB_VERSION = 2

export const STORES = {
  exercises: 'exercises',
  admins: 'admins',
} as const

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORES.exercises)) {
        db.createObjectStore(STORES.exercises, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.admins)) {
        db.createObjectStore(STORES.admins, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
