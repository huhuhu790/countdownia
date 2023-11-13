import { Box, CssBaseline } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import DragHandleIcon from "@mui/icons-material/DragHandle"
import OperationBar from "./OperationBar"
import Content, { ContentRef, TimeItem, TimeGroup } from "./Content"
import styles from "./Home.module.css"

const dragBar = 24
const sideBar = 24

function getTimeGroup(remain: number): TimeGroup {
    let t = remain
    const day = Math.ceil(t / (60 * 60 * 24))

    t = t % (60 * 60 * 24)
    const hour = Math.ceil(t / (60 * 60))

    t = t % (60 * 60)
    const minute = Math.ceil(t / 60)

    const seconds = t % 60
    return {
        day,
        hour,
        minute,
        seconds
    }
}

export default function Home() {
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<EventList>("countdownDate"))
    const box = useRef<HTMLDivElement>(null)
    const isUnlockRef = useRef(false)
    const contentRef = useRef<ContentRef>()
    const [isUnlock, setIsUnlock] = useState(false)
    const [isFocus, setIsFocus] = useState(false)
    const [time, setTime] = useState<TimeItem[]>([])

    useEffect(() => {
        document.body.style.setProperty("background", "transparent")
        return () => {
            document.body.style.removeProperty("background")
        }
    }, [])

    useEffect(() => {
        const now = Date.now()
        const elapsed = countdownDate.map(i => {
            const time = Number(((i.date - now) / 1000).toFixed(0))
            const sign = time >= 0 ? true : false
            return {
                ...i,
                date: Math.abs(time),
                sign
            }
        })

        function handleSetTime() {
            setTime(elapsed.map(i => ({
                ...i,
                timeGroup: getTimeGroup(i.date)
            })))
        }
        handleSetTime()

        let timeElapsed: number
        function onTimeout() {
            timeElapsed = window.setTimeout(() => {
                elapsed.forEach(i => i.sign ? --i.date : ++i.date)
                handleSetTime()
                onTimeout()
            }, 1000)
        }
        onTimeout()
        return () => {
            clearTimeout(timeElapsed)
        }
    }, [countdownDate])

    useEffect(() => {
        function countdownDateHasChanged(_: unknown, data: EventList) {
            setCountdownDate(data)
        }
        window.ipcRenderer.addListener("hide", handleBlur)
        window.ipcRenderer.addListener("show", handleFocus)
        window.ipcRenderer.addListener("countdownDateHasChanged", countdownDateHasChanged)
        return () => {
            window.ipcRenderer.removeListener("hide", handleBlur)
            window.ipcRenderer.removeListener("show", handleFocus)
            window.ipcRenderer.removeListener("countdownDateHasChanged", countdownDateHasChanged)
        }
    }, [])

    function handleFocus() {
        setIsFocus(true)
    }

    function handleBlur() {
        setIsFocus(false)
        if (isUnlockRef.current) handleLock(false)
    }

    function handleLock(status?: boolean) {
        const current = status ?? !isUnlock
        setIsUnlock(current)
        isUnlockRef.current = current

        let height = document.documentElement.clientHeight
        const width = document.documentElement.clientWidth
        height = current ? height + dragBar : height - dragBar
        window.ipcRenderer.send("setResizable", current)
        window.ipcRenderer.send("setWindowSize", width, height)
    }

    function handleContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        window.ipcRenderer.send("showCountdownContextMenu")
    }

    return (
        <>
            <CssBaseline />
            <Box
                className={styles.wrapper}
                ref={box}
                onContextMenu={handleContextMenu}
            >
                {
                    isUnlock ? <>
                        <Box className={styles.topLeft}></Box>
                        <Box className={styles.topRight}></Box>
                        <Box className={styles.bottomLeft}></Box>
                        <Box className={styles.bottomRight}></Box>
                    </> : null
                }

                <Box
                    className={styles.content}
                    style={{
                        border: `1px dashed ${isFocus ? "white" : "transparent"}`,
                        width: `calc(100% - ${sideBar}px)`
                    }}
                >
                    <Box
                        className={`${styles.dragBar} draggable`}
                        style={{
                            height: dragBar + "px",
                            display: isUnlock ? "" : "none"
                        }}
                        onContextMenu={e => e.preventDefault}
                    >
                        <DragHandleIcon />
                    </Box>
                    <Content time={time} isUnlock={isUnlock} ref={contentRef} dragBar={dragBar} />
                </Box>
                <OperationBar
                    isFocus={isFocus}
                    isUnlock={isUnlock}
                    handleLock={handleLock}
                    swiperRef={contentRef}
                    sideBar={sideBar}
                />
            </Box >
        </>
    )
}