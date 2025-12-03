import { useState } from 'react'

declare global {
    interface Window {
        gapi: any
        google: any
    }
}

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'

export function useGoogleDrive() {
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const initClient = async (clientId: string, apiKey: string) => {
        try {
            await new Promise<void>((resolve, reject) => {
                window.gapi.load('client:auth2', {
                    callback: resolve,
                    onerror: reject,
                })
            })

            await window.gapi.client.init({
                apiKey,
                clientId,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            })

            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn)

            // Handle the initial sign-in state.
            setIsSignedIn(window.gapi.auth2.getAuthInstance().isSignedIn.get())
            setIsInitialized(true)
            setError(null)
        } catch (err: any) {
            console.error('Error initializing Google Drive client', err)
            setError(err.message || 'Failed to initialize Google Drive')
            setIsInitialized(false)
        }
    }

    const signIn = async () => {
        try {
            await window.gapi.auth2.getAuthInstance().signIn()
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
        }
    }

    const signOut = async () => {
        try {
            await window.gapi.auth2.getAuthInstance().signOut()
        } catch (err: any) {
            setError(err.message || 'Failed to sign out')
        }
    }

    const uploadFile = async (content: string, filename: string) => {
        try {
            const file = new Blob([content], { type: 'application/json' })
            const metadata = {
                name: filename,
                mimeType: 'application/json',
                parents: ['appDataFolder'],
            }

            const form = new FormData()
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
            form.append('file', file)

            const accessToken = window.gapi.auth.getToken().access_token

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form,
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            return await response.json()
        } catch (err: any) {
            console.error('Upload error', err)
            throw err
        }
    }

    const listFiles = async () => {
        try {
            const response = await window.gapi.client.drive.files.list({
                spaces: 'appDataFolder',
                fields: 'nextPageToken, files(id, name, createdTime)',
                pageSize: 10,
                orderBy: 'createdTime desc',
            })
            return response.result.files
        } catch (err: any) {
            console.error('List files error', err)
            throw err
        }
    }

    const downloadFile = async (fileId: string) => {
        try {
            const response = await window.gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            })
            return response.body
        } catch (err: any) {
            console.error('Download error', err)
            throw err
        }
    }

    return {
        isInitialized,
        isSignedIn,
        error,
        initClient,
        signIn,
        signOut,
        uploadFile,
        listFiles,
        downloadFile,
    }
}
