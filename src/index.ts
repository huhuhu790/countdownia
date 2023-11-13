import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  nativeTheme,
  Tray
} from "electron"
import path from "node:path"
import { Dialogs } from "./utils/dialogs"
import { CustomStore, getStore, setStoreWatcher } from "./utils/initStore"
import {
  setAppEvent,
  setCountdownWindowEvent,
  setDialogWindowEvent,
  setMenuEvent,
  setStoreEvent
} from "./utils/initEvents"

if (require("electron-squirrel-startup")) app.quit()

declare const COUNTDOWN_WEBPACK_ENTRY: string
declare const COUNTDOWN_PRELOAD_WEBPACK_ENTRY: string
declare const CONFIG_WEBPACK_ENTRY: string
declare const CONFIG_PRELOAD_WEBPACK_ENTRY: string
declare const DIALOGS_WEBPACK_ENTRY: string
declare const DIALOGS_PRELOAD_WEBPACK_ENTRY: string
declare const LOADING_WEBPACK_ENTRY: string

const WM_INITMENU = 0x0116

const configWindowInitialWidth = 1400
const configWindowInitialHeight = 825
const configWindowMinWidth = 1400
const configWindowMinHeight = 825

const countdownWindowInitialWidth = 1000
const countdownWindowInitialHeight = 80
const countdownWindowMinWidth = 80
const countdownWindowMinHeight = 80

const dragBarWidth = 24

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
  contextMenu: Electron.Menu = null!,
  moreContextMenu: Electron.Menu = null!,
  store: CustomStore = null!,
  dialogs: Dialogs = null!


function showWindow(window: BrowserWindow) {
  window.restore()
  window.focus()
  window.show()
}

function exitApp() {
  configWindow.hide()
  countdownWindow.hide()
  configWindow.removeAllListeners()
  countdownWindow.removeAllListeners()
  app.quit()
}

function setStore() {
  store = getStore({
    countdownWindowInitialWidth,
    countdownWindowInitialHeight,
    configWindowInitialWidth,
    configWindowInitialHeight
  })
}

function setMenu() {
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
          click() {
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
  moreContextMenu = Menu.buildFromTemplate([
    {
      label: "上一个",
      click() {
        countdownWindow.webContents.send("previous")
      }
    },
    {
      label: "暂停",
      click() {
        countdownWindow.webContents.send("changePlayingMode")
      }
    },
    {
      label: "下一个",
      click() {
        countdownWindow.webContents.send("next")
      }
    }
  ])
}

function setTray() {
  // 设置托盘图标
  tray = new Tray(nativeImage.createFromPath(path.resolve(__dirname, "public", "favicon.ico")))
  tray
    .on("click", () => {
      showWindow(countdownWindow)
    })
    .on("double-click", () => {
      showWindow(configWindow)
    })
    .setToolTip("Countdownia")
  tray.setContextMenu(contextMenu)
}
function setCountdownWindow() {
  const size = store.get("size")
  const position = store.get("position")
  const alwaysOnTop = store.get("alwaysOnTop")
  countdownWindow = new BrowserWindow({
    icon: "public/favicon.ico",
    height: size.height,
    width: size.width,
    minHeight: countdownWindowMinHeight,
    minWidth: countdownWindowMinWidth,
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
        setTray()
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
        height: bounds.height - dragBarWidth
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
  const size = store.get("sizeConfig")
  configWindow = new BrowserWindow({
    icon: "public/favicon.ico",
    height: size.height,
    width: size.width,
    minHeight: configWindowMinHeight,
    minWidth: configWindowMinWidth,
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
    .addListener("resized", () => {
      const bounds = configWindow.getBounds()
      store.set("sizeConfig", {
        width: bounds.width,
        height: bounds.height
      })
    })
    .hookWindowMessage(WM_INITMENU, () => {
      configWindow.setEnabled(false)
      configWindow.setEnabled(true)
      contextMenu.popup({ window: configWindow })
    })
}

function setDialogsWindow() {
  dialogs = new Dialogs({ url: DIALOGS_WEBPACK_ENTRY, preload: DIALOGS_PRELOAD_WEBPACK_ENTRY, app })
}

function setLoadingWindow() {
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
}

const createWindow = () => {
  setStore()
  setMenu()
  setLoadingWindow()
  setCountdownWindow()
  setConfigWindow()
  setDialogsWindow()

  setStoreEvent({
    store
  })
  setMenuEvent({
    moreContextMenu,
    contextMenu
  })
  setCountdownWindowEvent({
    store,
    countdownWindow,
    minWidth: countdownWindowMinWidth,
    minHeight: countdownWindowMinHeight,
    dragBarWidth
  })
  setDialogWindowEvent({
    countdownWindow,
    configWindow,
    dialogs
  })
  setAppEvent({
    app,
    store,
    configWindow,
    darkTitleBar,
    lightTitleBar
  })

  setStoreWatcher({
    store,
    countdownWindow,
    configWindow
  })

  loadingWindow.on("ready-to-show", () => {
    app.setLoginItemSettings({
      openAtLogin: store.get("openAtLogin"),
    })
    countdownWindow.loadURL(COUNTDOWN_WEBPACK_ENTRY)
    configWindow.loadURL(CONFIG_WEBPACK_ENTRY)
  })
  loadingWindow.loadURL(LOADING_WEBPACK_ENTRY)
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
  .on("second-instance", () => {
    if (countdownWindow) {
      showWindow(countdownWindow)
    }
  })

// const reactDevToolsPath = path.join(
//   os.homedir(),
//   '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.28.0_0'
// )
// app.whenReady().then(async () => {
//   await session.defaultSession.loadExtension(reactDevToolsPath)
// })