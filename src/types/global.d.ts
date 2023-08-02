export interface IpcRendererHandlers {
    getStore: <T>(name: string) => T
    send: (channel: string, ...args: unknown[]) => void
    sendSync: <T>(channel: string, ...args: unknown[]) => T
    invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>
    addListener: (eventName: string, listener: (...args: unknown[]) => void) => void
    removeListener: (eventName: string, listener: (...args: unknown[]) => void) => void
}

declare global {
    interface Window {
        ipcRenderer: IpcRendererHandlers
    }

    interface DateItem {
        id: string
        date: number
        title: string
        line?: string
        endDate?: number
        description?: string
    }
    type DateList = DateItem[]
}