import { Box, CssBaseline } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import LockIcon from "@mui/icons-material/Lock"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import DragHandleIcon from "@mui/icons-material/DragHandle"
import NearMeIcon from "@mui/icons-material/NearMe"
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined"
import type { IpcRendererEvent } from "electron"
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import styles from "./Home.module.css"
import 'swiper/css'

const dragBar = window.ipcRenderer.getStore<number>("dragBar")
const sideBar = window.ipcRenderer.getStore<number>("sideBar")
const defaultLine = "距离$title还有$d天$h时$m分$s秒"
const defaultLineReverse = "距离$title已过去$d天$h时$m分$s秒"
interface TimeGroup {
    day: number
    hour: number
    minute: number
    seconds: number
}

interface TimeItem extends DateItem {
    sign: boolean
    timeGroup: TimeGroup
    endTimeGroup?: TimeGroup
}

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
    //new Date(2023, 12 - 1, 27, 8).getTime()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))
    const swiperRef = useRef<SwiperClass>()
    const box = useRef<HTMLDivElement>(null)
    const isUnlockRef = useRef(false)
    const [isUnlock, setIsUnlock] = useState(false)
    const [isAlwaysTop, setIsAlwaysTop] = useState(window.ipcRenderer.getStore<boolean>("alwaysOnTop"))
    const [fontSize, setFontSize] = useState(window.ipcRenderer.getStore<number>("fontSize"))
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
            let time = Number(((i.date - now) / 1000).toFixed(0))
            let sign = time >= 0 ? true : false
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
        function fontSizeHasChanged(e: IpcRendererEvent, data: number) {
            setFontSize(data)
        }
        function countdownDateHasChanged(e: IpcRendererEvent, data: DateList) {
            setCountdownDate(data)
        }
        window.ipcRenderer.addListener("hide", handleBlur)
        window.ipcRenderer.addListener("show", handleFocus)
        window.ipcRenderer.addListener("fontSizeHasChanged", fontSizeHasChanged)
        window.ipcRenderer.addListener("countdownDateHasChanged", countdownDateHasChanged)
        return () => {
            window.ipcRenderer.removeListener("hide", handleBlur)
            window.ipcRenderer.removeListener("show", handleFocus)
            window.ipcRenderer.removeListener("fontSizeHasChanged", fontSizeHasChanged)
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
        window.ipcRenderer.send("setWindowSize", width, height)
        window.ipcRenderer.send("setResizable", current)
    }

    function handleAlwaysTop() {
        const newStatus = !isAlwaysTop
        setIsAlwaysTop(newStatus)
        window.ipcRenderer.send("setAlwaysOnTop", newStatus)
    }

    function handleContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault()
        window.ipcRenderer.send("show-context-menu")
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
                    >
                        <DragHandleIcon />
                    </Box>
                    <Box className={styles.text} fontSize={fontSize}>
                        <Swiper
                            className={styles.swper}
                            direction="vertical"
                            speed={1000}
                            onSlideChange={() => console.log('slide change')}
                            onSwiper={(swiper) => swiperRef.current = swiper}
                            modules={[Autoplay]}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false
                            }}
                        >
                            {
                                time.map(i => {
                                    const s = (i.line ?? (i.sign ? defaultLine : defaultLineReverse))
                                        .replace("$title", i.title)
                                        .replace("$d", i.timeGroup.day.toString())
                                        .replace("$h", i.timeGroup.hour.toString())
                                        .replace("$m", i.timeGroup.minute.toString())
                                        .replace("$s", i.timeGroup.seconds.toString())
                                    return (
                                        <SwiperSlide
                                            className={styles.swperSlide}
                                            key={i.id}
                                        >
                                            {s}
                                        </SwiperSlide>
                                    )
                                })
                            }
                        </Swiper>
                    </Box>
                </Box>
                <Box
                    sx={{ width: sideBar }}
                    style={{
                        display: isFocus ? "" : "none"
                    }}
                >
                    <Box
                        className={styles.barItem}
                        onClick={() => handleLock()}
                    >
                        {isUnlock ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                    </Box>
                    <Box
                        className={styles.barItem}
                        onClick={handleAlwaysTop}
                    >
                        {isAlwaysTop ? <NearMeIcon fontSize="small" /> : <NearMeOutlinedIcon fontSize="small" />}
                    </Box>
                </Box>
            </Box >
        </>
    )
}