import { Box, Button, Input, Popover } from "@mui/material"
import { useMemo, useState } from "react"
import { RgbaColor, RgbaColorPicker } from "react-colorful"

let timeout: number | null = null
export function ColorPicker({
    backgroundColor,
    setBackgroundColor,
    disabled,
    setStore
}: {
    backgroundColor: RgbaColor
    setBackgroundColor: React.Dispatch<React.SetStateAction<RgbaColor>>
    disabled?: boolean
    setStore?: (value: RgbaColor) => void
}) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const backgroundColorString = useMemo(() => `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`, [backgroundColor])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)


    const setColor = (color: RgbaColor) => {
        if (timeout) clearTimeout(timeout)
        timeout = window.setTimeout(() => {
            setBackgroundColor(color)
            setStore && setStore(color)
        }, 200)
    }

    function changeColor(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: "r" | "g" | "b" | "a") {
        let value = Number(e.target.value)
        if (Number.isNaN(value)) return
        if (type !== "a") {
            if (value < 0) value = 0
            else if (value > 255) value = 255
        } else {
            if (value < 0) value = 0
            else if (value > 1) value = 1
        }

        setBackgroundColor(i => {
            i[type] = value
            setStore && setStore(i)
            return {
                ...i
            }
        })
    }

    return (
        <Box display="inline-block">
            <Button
                disabled={disabled}
                sx={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
                    minWidth: 0,
                    "&:disabled": {
                        backgroundColor: "grey!important",
                        background: "grey!important",
                        boxShadow: "grey!important",
                        border: "grey!important"
                    }
                }}
                style={{ backgroundColor: backgroundColorString }}
                onClick={handleClick}
            ></Button>
            <Popover
                keepMounted
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            overflow: "visible"
                        }
                    }
                }}
            >
                <RgbaColorPicker color={backgroundColor} onChange={setColor} />
                <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center" flex={1}>
                        R:
                        <Input value={backgroundColor.r} onChange={e => changeColor(e, "r")} sx={{ width: 30 }} />
                    </Box>
                    <Box display="flex" alignItems="center" flex={1}>
                        G:
                        <Input value={backgroundColor.g} onChange={e => changeColor(e, "g")} sx={{ width: 30 }} />
                    </Box>
                    <Box display="flex" alignItems="center" flex={1}>
                        B:
                        <Input value={backgroundColor.b} onChange={e => changeColor(e, "b")} sx={{ width: 30 }} />
                    </Box>
                    <Box display="flex" alignItems="center" flex={1}>
                        A:
                        <Input value={backgroundColor.a} onChange={e => changeColor(e, "a")} sx={{ width: 30 }} />
                    </Box>
                </Box>
            </Popover>
        </Box>
    )
}