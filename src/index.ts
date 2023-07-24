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
import type { RgbaColor } from "react-colorful"

declare const COUNTDOWN_WEBPACK_ENTRY: string
declare const COUNTDOWN_PRELOAD_WEBPACK_ENTRY: string
declare const CONFIG_WEBPACK_ENTRY: string
declare const CONFIG_PRELOAD_WEBPACK_ENTRY: string

const configWindowHeight = 700
const configWindowWidth = 1200

const homeWindowHeight = 100
const homeWindowWidth = 80

const dragBar = 24

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
  backgroundColor: RgbaColor
  useGradientColor: boolean
  gradientColorFrom: RgbaColor
  gradientColorTo: RgbaColor
}

let configWindow: BrowserWindow = null!
let homeWindow: BrowserWindow = null!
let tray: Tray = null!
let store: Store<StoreType> = null!

function exitApp() {
  configWindow.hide()
  homeWindow.hide()
  configWindow.removeAllListeners()
  homeWindow.removeAllListeners()
  app.quit()
}

function reset() {
  store.reset(
    "size",
    "position",
    "fontSize"
  )
  const size = store.get("size")
  homeWindow.setSize(size.width, size.height)
  homeWindow.center()
}
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
    label: "模式切换",
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
    label: "重置位置",
    click: reset
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
      homeWindow.show()
      homeWindow.focus()
    })
    .setToolTip("Countdownia")
}

const countdownContextMenu = Menu.buildFromTemplate([
  {
    label: "配置",
    click() {
      configWindow.show()
    }
  },
  {
    label: "退出",
    click: exitApp
  }
])
function setEvent() {
  ipcMain
    .on("setWindowSize", (event, width, height) => {
      homeWindow.setSize(width, height)
    })
    .on("setResizable", (event, canResize) => {
      homeWindow.resizable = canResize
    })
    .on("setAlwaysOnTop", (event, status) => {
      homeWindow.setAlwaysOnTop(status)
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
    .on("setFontSize", (event, fontSize) => {
      store.set("fontSize", fontSize)
    })
    .on("setBackgroundColor", (event, backgroundColor) => {
      store.set("backgroundColor", backgroundColor)
    })
    .on("setUseGradientColor", (event, useGradientColor) => {
      store.set("useGradientColor", useGradientColor)
    })
    .on("setGradientColorFrom", (event, gradientColorFrom) => {
      store.set("gradientColorFrom", gradientColorFrom)
    })
    .on("setGradientColorTo", (event, gradientColorTo) => {
      store.set("gradientColorTo", gradientColorTo)
    })
    .on("getStore", (event, name) => {
      event.returnValue = store.get(name)
    })
    .on("showCountdownContextMenu", (event) => {
      countdownContextMenu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
    })
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
    minHeight: homeWindowHeight - dragBar,
    minWidth: homeWindowWidth,
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
    minimizable: false,
    alwaysOnTop: alwaysOnTop
  })

  homeWindow
    .once("ready-to-show", () => {
      setContextMenu()
      homeWindow.show()
    })
    .addListener("close", (event) => {
      event.preventDefault()
      exitApp()
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
        height: bounds.height - dragBar
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
    .addListener("close", (event) => {
      event.preventDefault()
      configWindow.hide()
    })

  configWindow.loadURL(CONFIG_WEBPACK_ENTRY)
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
          height: 100 - dragBar
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
        default: false
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

  store.onDidChange("fontSize", (newValue, oldValue) => {
    homeWindow.webContents.send("fontSizeHasChanged", newValue)
    configWindow.webContents.send("fontSizeHasChanged", newValue)
  })

  store.onDidChange("countdownDate", (newValue, oldValue) => {
    homeWindow.webContents.send("countdownDateHasChanged", newValue)
    configWindow.webContents.send("countdownDateHasChanged", newValue)
  })

  store.onDidChange("backgroundColor", (newValue, oldValue) => {
    homeWindow.webContents.send("backgroundColorHasChanged", newValue)
    configWindow.webContents.send("backgroundColorHasChanged", newValue)
  })

  store.onDidChange("useGradientColor", (newValue, oldValue) => {
    homeWindow.webContents.send("useGradientColorHasChanged", newValue)
    configWindow.webContents.send("useGradientColorHasChanged", newValue)
  })

  store.onDidChange("gradientColorFrom", (newValue, oldValue) => {
    homeWindow.webContents.send("gradientColorFromHasChanged", newValue)
    configWindow.webContents.send("gradientColorFromHasChanged", newValue)
  })

  store.onDidChange("gradientColorTo", (newValue, oldValue) => {
    homeWindow.webContents.send("gradientColorToHasChanged", newValue)
    configWindow.webContents.send("gradientColorToHasChanged", newValue)
  })

  const createWindow = () => {
    setHomeWindow()
    setConfigWindow()
    setEvent()
  }

  app.on("ready", createWindow)

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}