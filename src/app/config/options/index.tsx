import {
    ListItem, List, Paper,
    Typography, TextField, Box,
    Switch, Divider, RadioGroup,
    Radio, FormControl, FormControlLabel
} from "@mui/material"
import type { IpcRendererEvent } from "electron"
import { useEffect, useMemo, useState } from "react"
import { ColorPicker } from "../../components/ColorPicker"
import { RgbaColor } from "react-colorful"

const maxFontSize = 300

export default function OptionsPage() {
    const [mode, setMode] = useState<string>(window.ipcRenderer.sendSync("getMode"))
    const [fontSize, setFontSize] = useState(window.ipcRenderer.getStore<number>("fontSize"))
    const [backgroundColor, setBackgroundColor] = useState(window.ipcRenderer.getStore<RgbaColor>("backgroundColor"))
    const [useGradientColor, setUseGradientColor] = useState(window.ipcRenderer.getStore<boolean>("useGradientColor"))
    const [gradientColorFrom, setGradientColorFrom] = useState(window.ipcRenderer.getStore<RgbaColor>("gradientColorFrom"))
    const [gradientColorTo, setGradientColorTo] = useState(window.ipcRenderer.getStore<RgbaColor>("gradientColorTo"))
    const [openAtLogin, setOpenAtLogin] = useState(window.ipcRenderer.getStore<boolean>("openAtLogin"))
    const backgroundColorString = useMemo(() => `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`, [backgroundColor])
    const gradientColorString = useMemo(() =>
        `linear-gradient(to right, 
            rgba(${gradientColorFrom.r},${gradientColorFrom.g},${gradientColorFrom.b},${gradientColorFrom.a}), 
            rgba(${gradientColorTo.r},${gradientColorTo.g},${gradientColorTo.b},${gradientColorTo.a}))`,
        [gradientColorFrom, gradientColorTo]
    )

    useEffect(() => {
        function fontSizeHasChanged(e: IpcRendererEvent, data: number) {
            setFontSize(data)
        }
        function backgroundColorHasChanged(e: IpcRendererEvent, data: RgbaColor) {
            setBackgroundColor(data)
        }
        function useGradientColorHasChanged(e: IpcRendererEvent, data: boolean) {
            setUseGradientColor(data)
        }
        function gradientColorFromHasChanged(e: IpcRendererEvent, data: RgbaColor) {
            setGradientColorFrom(data)
        }
        function gradientColorToHasChanged(e: IpcRendererEvent, data: RgbaColor) {
            setGradientColorTo(data)
        }
        function openAtLoginHasChanged(e: IpcRendererEvent, data: boolean) {
            setOpenAtLogin(data)
        }
        window.ipcRenderer.addListener("fontSizeHasChanged", fontSizeHasChanged)
        window.ipcRenderer.addListener("backgroundColorHasChanged", backgroundColorHasChanged)
        window.ipcRenderer.addListener("useGradientColorHasChanged", useGradientColorHasChanged)
        window.ipcRenderer.addListener("gradientColorFromHasChanged", gradientColorFromHasChanged)
        window.ipcRenderer.addListener("gradientColorToHasChanged", gradientColorToHasChanged)
        window.ipcRenderer.addListener("openAtLoginHasChanged", openAtLoginHasChanged)
        return () => {
            window.ipcRenderer.removeListener("fontSizeHasChanged", fontSizeHasChanged)
            window.ipcRenderer.removeListener("backgroundColorHasChanged", backgroundColorHasChanged)
            window.ipcRenderer.removeListener("useGradientColorHasChanged", useGradientColorHasChanged)
            window.ipcRenderer.removeListener("gradientColorFromHasChanged", gradientColorFromHasChanged)
            window.ipcRenderer.removeListener("gradientColorToHasChanged", gradientColorToHasChanged)
            window.ipcRenderer.removeListener("openAtLoginHasChanged", openAtLoginHasChanged)
        }
    }, [])

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(e.target.value)
        if (Number.isNaN(value) || value < 0) return
        if (value < 0) value = 0
        else if (value > maxFontSize) value = maxFontSize
        setFontSize(value)
        window.ipcRenderer.send("setFontSize", value)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUseGradientColor(event.target.checked)
        window.ipcRenderer.send("setUseGradientColor", event.target.checked)
    }

    const handleSetOpenAtLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
        window.ipcRenderer.send("setOpenAtLogin", event.target.checked)
        setOpenAtLogin(event.target.checked)
    }

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        window.ipcRenderer.send("setMode", value)
        setMode(value)
    }

    function handleSetBackgroundColor(i: RgbaColor) {
        window.ipcRenderer.send("setBackgroundColor", i)
    }

    function handleSetGradientColorFrom(i: RgbaColor) {
        window.ipcRenderer.send("setGradientColorFrom", i)
    }

    function handleSetGradientColorTo(i: RgbaColor) {
        window.ipcRenderer.send("setGradientColorTo", i)
    }

    return (
        <Paper
            elevation={2}
            sx={{
                py: 4,
                height: "100%",
                overflow: "auto",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <List sx={{ width: "50%", margin: "auto", flex: 0 }}>
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Open on startup:</Typography>
                    <Switch
                        checked={openAtLogin}
                        onChange={handleSetOpenAtLogin}
                    />
                </ListItem>
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Theme:</Typography>
                    <FormControl>
                        <RadioGroup
                            row
                            value={mode}
                            onChange={handleRadioChange}
                        >
                            <FormControlLabel value="system" control={<Radio />} label="System" />
                            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                            <FormControlLabel value="light" control={<Radio />} label="Light" />
                        </RadioGroup>
                    </FormControl>
                </ListItem>
                <Divider />
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>FontSize(Max:{maxFontSize}):</Typography>
                    <TextField
                        value={fontSize}
                        onChange={handleFontSizeChange}
                    />
                </ListItem>
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Color:</Typography>
                    <ColorPicker
                        disabled={useGradientColor}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        setStore={handleSetBackgroundColor}
                    />
                </ListItem>
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography>Gradient Color:</Typography>
                    <Switch
                        checked={useGradientColor}
                        onChange={handleChange}
                    />
                </ListItem>
                <ListItem sx={{ display: "flex", justifyContent: "end" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
                        <Typography mr={1}>From:</Typography>
                        <ColorPicker
                            disabled={!useGradientColor}
                            backgroundColor={gradientColorFrom}
                            setBackgroundColor={setGradientColorFrom}
                            setStore={handleSetGradientColorFrom}
                        />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography mr={1}>To:</Typography>
                        <ColorPicker
                            disabled={!useGradientColor}
                            backgroundColor={gradientColorTo}
                            setBackgroundColor={setGradientColorTo}
                            setStore={handleSetGradientColorTo}
                        />
                    </Box>
                </ListItem>
            </List>
            <Box
                sx={{
                    fontSize: fontSize + "px",
                    background: useGradientColor ? gradientColorString : backgroundColorString,
                    backgroundClip: "text",
                    color: "transparent",
                    textAlign: "left",
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mx: 8
                }}
            >
                The quick brown fox jumps over the lazy dog<br />
                距离$title还有$d天$h时$m分$s秒
            </Box>
        </Paper >
    )
}