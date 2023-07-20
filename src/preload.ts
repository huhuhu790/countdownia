import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld(
    "ipcRenderer",
    {
        getStore<T>(name: string): T {
            return ipcRenderer.sendSync("getStore", name)
        },
        send(channel: string, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args)
        },
        sendSync<T>(channel: string, ...args: unknown[]): T {
            return ipcRenderer.sendSync(channel, ...args)
        },
        async invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
            return await ipcRenderer.invoke(channel, ...args)
        },
        addListener(eventName: string, listener: (...args: any[]) => void) {
            ipcRenderer.addListener(eventName, listener)
        },
        removeListener(eventName: string, listener: (...args: unknown[]) => void) {
            ipcRenderer.removeListener(eventName, listener)
        },
    }
)