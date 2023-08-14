import {
    BrowserWindow,
    ipcMain,
    nativeTheme,
} from "electron"
import type Store from "electron-store"
import type { StoreType } from "./initStore"
import { randomUUID } from "crypto"
import { DIALOG_NAMES } from "./dialogNames"
import type { Dialogs } from "./dialogs"

type CustomStore = Store<StoreType>

export function setAppEvent({
    store,
    configWindow,
    app,
    darkTitleBar,
    lightTitleBar
}: {
    app: Electron.App
    store: CustomStore
    configWindow: Electron.BrowserWindow
    darkTitleBar: Electron.TitleBarOverlayOptions
    lightTitleBar: Electron.TitleBarOverlayOptions
}) {
    ipcMain
        // app
        .on("setOpenAtLogin", (event, openAtLogin: boolean) => {
            store.set("openAtLogin", openAtLogin)
            app.setLoginItemSettings({
                openAtLogin
            })
        })
        .on("getMode", (event) => {
            event.returnValue = nativeTheme.themeSource
        })
        .on("setMode", (event, mode: Electron.NativeTheme["themeSource"]) => {
            nativeTheme.themeSource = mode
            configWindow.setTitleBarOverlay(nativeTheme.shouldUseDarkColors ? darkTitleBar : lightTitleBar)
        })
}

export function setCountdownWindowEvent({
    store,
    countdownWindow,
    minWidth,
    minHeight,
    dragBarWidth
}: {
    store: CustomStore
    countdownWindow: Electron.BrowserWindow
    minWidth: number
    minHeight: number
    dragBarWidth: number
}) {
    ipcMain
        .on("setWindowSize", (event, width: number, height: number) => {
            countdownWindow.setSize(width, height)
        })
        .on("setResizable", (event, canResize: boolean) => {
            countdownWindow.resizable = canResize
            if (canResize)
                countdownWindow.setMinimumSize(minWidth, minHeight + dragBarWidth)
            else
                countdownWindow.setMinimumSize(minWidth, minHeight)
        })
        .on("setAlwaysOnTop", (event, status: boolean) => {
            countdownWindow.setAlwaysOnTop(status)
            store.set("alwaysOnTop", status)
        })
}

export function setDialogWindowEvent({
    configWindow,
    countdownWindow,
    dialogs
}: {
    configWindow: Electron.BrowserWindow
    countdownWindow: Electron.BrowserWindow
    dialogs: Dialogs
}) {
    ipcMain
        // dialog
        .on("hideDialog", (event, type: DIALOG_NAMES) => {
            dialogs.destroy(type)
        })
        .on("openDialog", (event, { type, height, width, ...extraInfo }: { type: DIALOG_NAMES, height?: number, width?: number }) => {
            let parent: Electron.BrowserWindow
            if (type.includes("config")) parent = configWindow
            else if (type.includes("countdown")) parent = countdownWindow
            dialogs.open({ type, parent, height, width, extraInfo })
        })
}

export function setMenuEvent({
    moreContextMenu,
    contextMenu
}: {
    moreContextMenu: Electron.Menu
    contextMenu: Electron.Menu
}) {
    ipcMain
        // context menu
        .on("showCountdownContextMenu", (event) => {
            contextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
        })
        .on("showMoreContextMenu", (event) => {
            moreContextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
        })
}

export function setStoreEvent({
    store
}: {
    store: CustomStore
}) {
    ipcMain
        .on("getStore", (event, name: string) => {
            event.returnValue = store.get(name)
        })
        .on("setCountdownDate", (event, dateItem: DateItem) => {
            const countdownDate = store.get("countdownDate")
            if (dateItem.id) {
                const index = countdownDate.findIndex(i => i.id === dateItem.id)
                if (index !== -1) countdownDate.splice(index, 1, dateItem)
            } else countdownDate.push({ ...dateItem, id: randomUUID() })
            store.set("countdownDate", countdownDate)
        })
        .on("deleteCountdownDate", (event, id: string) => {
            const countdownDate = store.get("countdownDate")
            const index = countdownDate.findIndex(i => i.id = id)
            if (index === -1) return
            else countdownDate.splice(index, 1)
            store.set("countdownDate", countdownDate)
        })
        .on("setFontSize", (event, fontSize: string) => {
            store.set("fontSize", fontSize)
        })
        .on("setBackgroundColor", (event, backgroundColor: string) => {
            store.set("backgroundColor", backgroundColor)
        })
        .on("setUseGradientColor", (event, useGradientColor: string) => {
            store.set("useGradientColor", useGradientColor)
        })
        .on("setGradientColorFrom", (event, gradientColorFrom: string) => {
            store.set("gradientColorFrom", gradientColorFrom)
        })
        .on("setGradientColorTo", (event, gradientColorTo: string) => {
            store.set("gradientColorTo", gradientColorTo)
        })
}