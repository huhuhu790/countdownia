import { type App, BrowserWindow } from "electron"
import { DIALOG_NAMES } from "./dialogNames"

const WM_INITMENU = 0x0116

interface DialogProps {
    url: string
    preload: string
    app: App
}
interface DialogsList {
    name: string
    window: BrowserWindow
}
interface OpenFuc {
    parent: BrowserWindow
    type: DIALOG_NAMES
    width?: number
    height?: number
    extraInfo?: unknown
}
export class Dialogs {
    private dialogsList: DialogsList[] = []
    private url
    private preload
    private app

    constructor({
        url,
        preload,
        app
    }: DialogProps) {
        this.url = url
        this.preload = preload
        this.app = app
    }

    private findIndex(type: DIALOG_NAMES) {
        return this.dialogsList.findIndex(i => i.name === type)
    }

    destroy(type: DIALOG_NAMES) {
        const index = this.findIndex(type)
        if (index !== -1) {
            const dialogsWindow = this.dialogsList[index].window
            dialogsWindow.close()
            this.dialogsList.splice(index, 1)
        }
    }

    open({ parent, type, width = 400, height = 300, extraInfo }: OpenFuc) {
        const index = this.findIndex(type)
        if (index !== -1) return
        const dialogsWindow = new BrowserWindow({
            icon: "public/favicon.ico",
            height,
            width,
            webPreferences: {
                preload: this.preload,
                devTools: !this.app.isPackaged
            },
            fullscreenable: false,
            transparent: true,
            frame: false,
            show: false,
            maximizable: false,
            minimizable: false,
            resizable: false,
            modal: true,
            parent
        })
        dialogsWindow.on("ready-to-show", () => {
            dialogsWindow.show()
            dialogsWindow.webContents.send("open-dialog-extraInfo", extraInfo)
        })
        dialogsWindow.hookWindowMessage(WM_INITMENU, () => {
            dialogsWindow.setEnabled(false)
            dialogsWindow.setEnabled(true)
        })
        dialogsWindow.loadURL(`${this.url}?type=${type}`)
        this.dialogsList.push({
            name: type,
            window: dialogsWindow
        })
    }
}