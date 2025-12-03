import { openDB, type DBSchema } from 'idb'

interface FlowFiDB extends DBSchema {
    receipts: {
        key: string
        value: {
            id: string
            blob: Blob
            createdAt: number
        }
    }
}

const DB_NAME = 'flowfi-db'
const STORE_NAME = 'receipts'

export const initDB = async () => {
    return openDB<FlowFiDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            }
        },
    })
}

export const saveReceipt = async (id: string, file: File): Promise<void> => {
    const db = await initDB()
    await db.put(STORE_NAME, {
        id,
        blob: file,
        createdAt: Date.now(),
    })
}

export const getReceipt = async (id: string): Promise<Blob | undefined> => {
    const db = await initDB()
    const result = await db.get(STORE_NAME, id)
    return result?.blob
}

export const deleteReceipt = async (id: string): Promise<void> => {
    const db = await initDB()
    await db.delete(STORE_NAME, id)
}
