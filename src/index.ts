import {
  app,
  autoUpdater,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  type NativeTheme,
  Tray
} from "electron"
import Store from "electron-store"
import { handleSquirrelEvent } from "./utils/handleSquirrelEvent"
import { randomUUID } from "crypto"
import path from "node:path"
import type { RgbaColor } from "react-colorful"
import { Dialogs } from "./utils/dialogs"
import { DIALOG_NAMES } from "./utils/dialogNames"

interface StoreType {
  size: {
    width: number
    height: number
  }
  countdownDate: DateList
  position: {
    x: number
    y: number
  }
  alwaysOnTop: boolean
  openAtLogin: boolean
  fontSize: number
  backgroundColor: RgbaColor
  useGradientColor: boolean
  gradientColorFrom: RgbaColor
  gradientColorTo: RgbaColor
}

declare const COUNTDOWN_WEBPACK_ENTRY: string
declare const COUNTDOWN_PRELOAD_WEBPACK_ENTRY: string
declare const CONFIG_WEBPACK_ENTRY: string
declare const CONFIG_PRELOAD_WEBPACK_ENTRY: string
declare const DIALOGS_WEBPACK_ENTRY: string
declare const DIALOGS_PRELOAD_WEBPACK_ENTRY: string
declare const LOADING_WEBPACK_ENTRY: string

const WM_INITMENU = 0x0116

const configWindowWidth = 1200
const configWindowHeight = 700

const countdownWindowWidth = 80
const countdownWindowHeight = 80

const dragBar = 24

const darkTitleBar = {
  color: "rgba(0,0,0,0)",
  symbolColor: "white",
  height: 32
}

const lightTitleBar = {
  color: "rgba(0,0,0,0)",
  symbolColor: "black",
  height: 32
}

let configWindow: BrowserWindow = null!,
  countdownWindow: BrowserWindow = null!,
  loadingWindow: BrowserWindow = null!,
  tray: Tray = null!,
  store: Store<StoreType> = null!,
  contextMenu: Menu = null!

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// this should be placed at top of main.js to handle setup events quickly
if (!handleSquirrelEvent(app)) {
  /*************** dialog **************/
  const dialogs = new Dialogs({ url: DIALOGS_WEBPACK_ENTRY, preload: DIALOGS_PRELOAD_WEBPACK_ENTRY, app })
  /*************** store ***************/
  store = new Store<StoreType>({
    schema: {
      size: {
        type: "object",
        default: {
          width: 1200,
          height: countdownWindowHeight
        }
      },
      countdownDate: {
        type: "array",
        default: [
          {
            id: "01",
            date: 1703635200000,
            title: "瓜瓜变猪",
            description: "瓜瓜变猪"
          },
          {
            id: "43e29468-b414-4f2b-aade-c16c35226f8d",
            date: 1690473600000,
            title: "瓜瓜猪",
            description: "瓜瓜猪"
          },
          {
            id: "e4c84150-f214-4e46-9de0-35be5f312e73",
            date: 1689177600000,
            title: "瓜瓜猪过"
          }
        ]
      },
      position: {
        type: "object",
        default: {}
      },
      alwaysOnTop: {
        type: "boolean",
        default: true
      },
      fontSize: {
        type: "number",
        default: 48
      },
      backgroundColor: {
        type: "object",
        default: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      },
      useGradientColor: {
        type: "boolean",
        default: false
      },
      openAtLogin: {
        type: "boolean",
        default: false
      },
      gradientColorFrom: {
        type: "object",
        default: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      },
      gradientColorTo: {
        type: "object",
        default: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      }
    }
  })

  function setStore() {
    store.onDidChange("fontSize", (newValue) => {
      countdownWindow.webContents.send("fontSizeHasChanged", newValue)
      configWindow.webContents.send("fontSizeHasChanged", newValue)
    })

    store.onDidChange("countdownDate", (newValue) => {
      countdownWindow.webContents.send("countdownDateHasChanged", newValue)
      configWindow.webContents.send("countdownDateHasChanged", newValue)
    })

    store.onDidChange("backgroundColor", (newValue) => {
      countdownWindow.webContents.send("backgroundColorHasChanged", newValue)
      configWindow.webContents.send("backgroundColorHasChanged", newValue)
    })

    store.onDidChange("useGradientColor", (newValue) => {
      countdownWindow.webContents.send("useGradientColorHasChanged", newValue)
      configWindow.webContents.send("useGradientColorHasChanged", newValue)
    })

    store.onDidChange("gradientColorFrom", (newValue) => {
      countdownWindow.webContents.send("gradientColorFromHasChanged", newValue)
      configWindow.webContents.send("gradientColorFromHasChanged", newValue)
    })

    store.onDidChange("gradientColorTo", (newValue) => {
      countdownWindow.webContents.send("gradientColorToHasChanged", newValue)
      configWindow.webContents.send("gradientColorToHasChanged", newValue)
    })

    store.onDidChange("openAtLogin", (newValue) => {
      configWindow.webContents.send("openAtLoginHasChanged", newValue)
    })
  }

  /*************** menu & tray ***************/
  function exitApp() {
    configWindow.hide()
    countdownWindow.hide()
    configWindow.removeAllListeners()
    countdownWindow.removeAllListeners()
    app.quit()
  }

  function reset() {
    store.reset(
      "size",
      "position",
      "fontSize"
    )
    const size = store.get("size")
    countdownWindow.setSize(size.width, size.height)
    BrowserWindow.getAllWindows().forEach(i => {
      i.center()
    })
    const bounds = countdownWindow.getBounds()
    store.set("position", {
      x: bounds.x,
      y: bounds.y
    })
  }

  function showWindow(window: BrowserWindow) {
    window.restore()
    window.focus()
    window.show()
  }

  // 设置菜单列表
  contextMenu = Menu.buildFromTemplate([
    {
      label: "配置",
      click() {
        showWindow(configWindow)
      }
    },
    {
      label: "系统",
      type: "submenu",
      submenu: [
        {
          label: "重置位置",
          click: reset
        },
        {
          label: "重启",
          click() {
            app.relaunch()
            exitApp()
          }
        }
      ]
    },
    {
      type: "separator"
    },
    {
      label: "退出",
      click: exitApp
    }
  ])

  function setContextMenu() {
    // 设置托盘图标
    tray = new Tray(nativeImage.createFromPath(path.resolve(__dirname, "public", "favicon.ico")))
    tray.setContextMenu(contextMenu)
    tray
      .addListener("click", () => {
        showWindow(countdownWindow)
      })
      .setToolTip("Countdownia")
  }
  /*************** event ***************/
  function setEvent() {
    ipcMain
      // home window
      .on("setWindowSize", (event, width: number, height: number) => {
        countdownWindow.setSize(width, height)
      })
      .on("setResizable", (event, canResize: boolean) => {
        countdownWindow.resizable = canResize
        if (canResize)
          countdownWindow.setMinimumSize(countdownWindowWidth, countdownWindowHeight + dragBar)
        else
          countdownWindow.setMinimumSize(countdownWindowWidth, countdownWindowHeight)
      })
      .on("setAlwaysOnTop", (event, status: boolean) => {
        countdownWindow.setAlwaysOnTop(status)
        store.set("alwaysOnTop", status)
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
      // app
      .on("setOpenAtLogin", (event, openAtLogin: boolean) => {
        store.set("openAtLogin", openAtLogin)
        app.setLoginItemSettings({
          openAtLogin
        })
      })
      // store
      .on("getStore", (event, name: string) => {
        event.returnValue = store.get(name)
      })
      .on("getMode", (event) => {
        event.returnValue = nativeTheme.themeSource
      })
      .on("setMode", (event, mode: NativeTheme["themeSource"]) => {
        nativeTheme.themeSource = mode
        configWindow.setTitleBarOverlay(nativeTheme.shouldUseDarkColors ? darkTitleBar : lightTitleBar)
      })
      // context menu
      .on("showCountdownContextMenu", (event) => {
        contextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
      })
      // dialog
      .on("hideDialog", (event, type: DIALOG_NAMES) => {
        dialogs.destroy(type)
      })
      .on("openDialog", (event, { type, height, width, ...extraInfo }: { type: DIALOG_NAMES, height?: number, width?: number }) => {
        let parent: BrowserWindow
        if (type.includes("config")) parent = configWindow
        else if (type.includes("countdown")) parent = countdownWindow
        dialogs.open({ type, parent, height, width, extraInfo })
      })
  }
  /*************** window **************/
  function setCountdownWindow() {
    const size = store.get("size")
    const position = store.get("position")
    const alwaysOnTop = store.get("alwaysOnTop")
    countdownWindow = new BrowserWindow({
      icon: "public/favicon.ico",
      height: size.height,
      width: size.width,
      minHeight: countdownWindowHeight,
      minWidth: countdownWindowWidth,
      x: position.x,
      y: position.y,
      webPreferences: {
        preload: COUNTDOWN_PRELOAD_WEBPACK_ENTRY,
        devTools: !app.isPackaged
      },
      fullscreenable: false,
      show: false,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      maximizable: false,
      minimizable: false,
      alwaysOnTop: alwaysOnTop
    })
    countdownWindow
      .once("ready-to-show", () => {
        setTimeout(() => {
          loadingWindow.close()
          showWindow(countdownWindow)
          setContextMenu()
        }, 3000)
      })
      .addListener("close", (event) => {
        event.preventDefault()
        exitApp()
      })
      .addListener("minimize", () => {
        countdownWindow.webContents.send("hide")
        countdownWindow.restore()
      })
      .addListener("focus", () => {
        countdownWindow.webContents.send("show")
      })
      .addListener("blur", () => {
        countdownWindow.webContents.send("hide")
      })
      .addListener("resized", () => {
        const bounds = countdownWindow.getBounds()
        store.set("size", {
          width: bounds.width,
          height: bounds.height - dragBar
        })
      })
      .addListener("moved", () => {
        const bounds = countdownWindow.getBounds()
        store.set("position", {
          x: bounds.x,
          y: bounds.y
        })
      })
      .addListener("system-context-menu", (e) => {
        e.preventDefault()
      })
      .hookWindowMessage(WM_INITMENU, () => {
        countdownWindow.setEnabled(false)
        countdownWindow.setEnabled(true)
        contextMenu.popup({ window: countdownWindow })
      })
  }

  function setConfigWindow() {
    configWindow = new BrowserWindow({
      icon: "public/favicon.ico",
      height: configWindowHeight,
      width: configWindowWidth,
      minHeight: configWindowHeight,
      minWidth: configWindowWidth,
      fullscreenable: false,
      webPreferences: {
        preload: CONFIG_PRELOAD_WEBPACK_ENTRY,
        devTools: !app.isPackaged
      },
      titleBarStyle: "hidden",
      titleBarOverlay: nativeTheme.shouldUseDarkColors ? darkTitleBar : lightTitleBar,
      show: false
    })
    configWindow
      .addListener("close", (event) => {
        event.preventDefault()
        configWindow.hide()
      })
      .addListener("system-context-menu", (e) => {
        e.preventDefault()
      })
      .hookWindowMessage(WM_INITMENU, () => {
        configWindow.setEnabled(false)
        configWindow.setEnabled(true)
        contextMenu.popup({ window: configWindow })
      })
  }

  function setLoadingWindow(fuc: () => void) {
    loadingWindow = new BrowserWindow({
      icon: "public/favicon.ico",
      height: 300,
      width: 300,
      resizable: false,
      webPreferences: {
        devTools: !app.isPackaged
      },
      fullscreenable: false,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      maximizable: false,
      minimizable: false,
      alwaysOnTop: true,
    })
    loadingWindow.on("ready-to-show", () => {
      fuc()
    })
    loadingWindow.loadURL(LOADING_WEBPACK_ENTRY)
  }

  /*************** app ****************/
  const createWindow = () => {
    setLoadingWindow(() => {
      setCountdownWindow()
      setConfigWindow()
      setEvent()
      setStore()
      countdownWindow.loadURL(COUNTDOWN_WEBPACK_ENTRY)
      configWindow.loadURL(CONFIG_WEBPACK_ENTRY)
    })
  }

  app
    .on("ready", createWindow)
    .on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit()
      }
    })
    .on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
    .on('second-instance', () => {
      if (countdownWindow) {
        showWindow(countdownWindow)
      }
    })
    .setLoginItemSettings({
      openAtLogin: store.get("openAtLogin"),
    })

  /*************** auto update ***************/
  /*** I'm going to need a package server! ***/
  // const server = "https://your-deployment-url.com"
  // const url = `${server}/update/${process.platform}/${app.getVersion()}`

  // autoUpdater.setFeedURL({ url })
  // setInterval(() => {
  //   autoUpdater.checkForUpdates()
  // }, 60000)
  // autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  //   dialog.showMessageBox({
  //     type: "info",
  //     buttons: ["Restart", "Later"],
  //     title: "Application Update",
  //     message: process.platform === "win32" ? releaseNotes : releaseName,
  //     detail:
  //       "A new version has been downloaded. Restart the application to apply the updates"
  //   })
  //     .then((returnValue) => {
  //       if (returnValue.response === 0) autoUpdater.quitAndInstall()
  //     })
  // })
  // autoUpdater.on("error", (message) => {
  //   console.error("There was a problem updating the application")
  //   console.error(message)
  // })
}