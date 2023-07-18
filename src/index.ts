import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  Tray
} from "electron"
import Store from "electron-store"
import { handleSquirrelEvent } from "./utils/handleSquirrelEvent"
import { randomUUID } from "crypto"
import path from "node:path"
declare const COUNTDOWN_WEBPACK_ENTRY: string
declare const COUNTDOWN_PRELOAD_WEBPACK_ENTRY: string
declare const CONFIG_WEBPACK_ENTRY: string
declare const CONFIG_PRELOAD_WEBPACK_ENTRY: string

const configWindowHeight = 700
const configWindowWidth = 1200

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
  fontSize: number
  dragBar: number
  sideBar: number
}

let configWindow: BrowserWindow = null!
let homeWindow: BrowserWindow = null!
let tray: Tray = null!
let store: Store<StoreType> = null!
// 设置菜单列表
const contextMenu = Menu.buildFromTemplate([
  {
    label: "Countdownia",
    enabled: false,
  },
  {
    type: "separator"
  },
  {
    label: "配置",
    click() {
      configWindow.show()
    }
  },
  {
    label: "模式",
    click() {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = "light"
      } else {
        nativeTheme.themeSource = "dark"
      }
    }
  },
  {
    label: "系统模式",
    click() {
      nativeTheme.themeSource = "system"
    }
  },
  {
    type: "separator"
  },
  {
    label: "重置",
    click() {
      store.clear()
      exitApp()
    }
  },
  {
    label: "退出",
    click: exitApp
  }
])
function setContextMenu() {
  // 设置托盘图标
  tray = new Tray(nativeImage.createFromPath(path.resolve(__dirname, "assets", "favicon.ico")))
  tray.setContextMenu(contextMenu)
  tray
    .addListener("click", () => {
      homeWindow.show()
      homeWindow.focus()
    })
    .setToolTip("Countdownia")
}

function setEvent() {
  ipcMain
    // 
    .on("setWindowSize", (event, width, height) => {
      homeWindow.setSize(width, height)
    })
    .on("setResizable", (event, canResize) => {
      homeWindow.resizable = canResize
    })
    // 
    .on("setAlwaysOnTop", (event, status) => {
      homeWindow.setAlwaysOnTop(status)
      store.set("alwaysOnTop", status)
    })
    .on("setCountdownDate", (event, dateItem: DateItem) => {
      const countdownDate = store.get("countdownDate")
      if (dateItem.id) {
        const index = countdownDate.findIndex(i => i.id = dateItem.id)
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
    .on("setFontSize", (event, fontSize) => {
      store.set("fontSize", fontSize)
    })
    // 
    .on("getStore", (event, name) => {
      event.returnValue = store.get(name)
    })
    // 
    .on("show-context-menu", (event) => {
      contextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
    })
    // 
    .on("dark-mode:system", () => {
      nativeTheme.themeSource = "system"
    })
    .handle("dark-mode:toggle", () => {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = "light"
      } else {
        nativeTheme.themeSource = "dark"
      }
      return nativeTheme.shouldUseDarkColors
    })
}

function setHomeWindow() {
  const size = store.get("size")
  const position = store.get("position")
  const alwaysOnTop = store.get("alwaysOnTop")
  homeWindow = new BrowserWindow({
    icon: "public/favicon.ico",
    height: size.height,
    width: size.width,
    minHeight: 50,
    minWidth: 50,
    x: position.x,
    y: position.y,
    webPreferences: {
      preload: COUNTDOWN_PRELOAD_WEBPACK_ENTRY
    },
    show: false,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    maximizable: false,
    alwaysOnTop: alwaysOnTop
  })

  homeWindow
    .once("ready-to-show", () => {
      setContextMenu()
      homeWindow.show()
    })
    .addListener("minimize", () => {
      homeWindow.webContents.send("hide")
    })
    .addListener("focus", () => {
      homeWindow.webContents.send("show")
    })
    .addListener("blur", () => {
      homeWindow.webContents.send("hide")
    })
    .addListener("resized", () => {
      const bounds = homeWindow.getBounds()
      store.set("size", {
        width: bounds.width,
        height: bounds.height - store.get("dragBar")
      })
    })
    .addListener("moved", () => {
      const bounds = homeWindow.getBounds()
      store.set("position", {
        x: bounds.x,
        y: bounds.y
      })
    })

  homeWindow.loadURL(COUNTDOWN_WEBPACK_ENTRY)
}

function setConfigWindow() {
  configWindow = new BrowserWindow({
    icon: "public/favicon.ico",
    height: configWindowHeight,
    width: configWindowWidth,
    minHeight: configWindowHeight,
    minWidth: configWindowWidth,
    webPreferences: {
      preload: CONFIG_PRELOAD_WEBPACK_ENTRY
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0,0,0,0)",
      symbolColor: "white",
      height: 32
    },
    show: false
  })
  configWindow
    .once("ready-to-show", () => {
      configWindow.show()
    })
    .addListener("close", (event) => {
      event.preventDefault()
      configWindow.hide()
    })

  configWindow.loadURL(CONFIG_WEBPACK_ENTRY)
}

function exitApp() {
  configWindow.hide()
  homeWindow.hide()
  configWindow.removeAllListeners()
  homeWindow.removeAllListeners()
  app.quit()
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don"t do anything else
} else {
  store = new Store<StoreType>({
    schema: {
      size: {
        type: "object",
        default: {
          width: 800,
          height: 100
        }
      },
      countdownDate: {
        type: "array",
        default: [
          {
            id: "01",
            date: 1703635200000,
            title: "瓜瓜"
          }
        ]
      },
      position: {
        type: "object",
        default: {}
      },
      alwaysOnTop: {
        type: "boolean",
        default: false
      },
      fontSize: {
        type: "number",
        default: 48
      },
      dragBar: {
        type: "number",
        default: 24
      },
      sideBar: {
        type: "number",
        default: 24
      },
    }
  })

  store.onDidChange("fontSize", (newValue, oldValue) => {
    console.log(newValue)
    homeWindow.webContents.send("fontSizeHasChanged", newValue)
    configWindow.webContents.send("fontSizeHasChanged", newValue)
  })

  store.onDidChange("countdownDate", (newValue, oldValue) => {
    console.log(newValue)
    homeWindow.webContents.send("countdownDateHasChanged", newValue)
    configWindow.webContents.send("countdownDateHasChanged", newValue)
  })

  const createWindow = () => {
    setHomeWindow()
    setConfigWindow()
    setEvent()
  }

  app.on("ready", createWindow)
  // Quit when all windows are closed, except on macOS. There, it"s common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })
  app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}