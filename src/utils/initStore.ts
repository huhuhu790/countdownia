import type { RgbaColor } from "react-colorful"
import Store from "electron-store"

export interface StoreType {
    size: {
        width: number
        height: number
    }
    sizeConfig: {
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

export type CustomStore = Store<StoreType>

export function getStore({
    countdownWindowInitialWidth,
    countdownWindowInitialHeight,
    configWindowInitialWidth,
    configWindowInitialHeight
}: {
    countdownWindowInitialWidth: number
    countdownWindowInitialHeight: number
    configWindowInitialWidth: number
    configWindowInitialHeight: number
}) {
    return new Store<StoreType>({
        schema: {
            size: {
                type: "object",
                default: {
                    width: countdownWindowInitialWidth,
                    height: countdownWindowInitialHeight
                }
            },
            sizeConfig: {
                type: "object",
                default: {
                    width: configWindowInitialWidth,
                    height: configWindowInitialHeight
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
}

export function setStoreWatcher({
    countdownWindow,
    configWindow,
    store
}: {
    countdownWindow: Electron.BrowserWindow
    configWindow: Electron.BrowserWindow
    store: CustomStore
}) {

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