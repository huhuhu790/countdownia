import { Box, Button, CssBaseline, IconButton } from "@mui/material"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import LockIcon from "@mui/icons-material/Lock"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import DragHandleIcon from "@mui/icons-material/DragHandle"
import NearMeIcon from "@mui/icons-material/NearMe"
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { Autoplay } from "swiper/modules"
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react"
import type { RgbaColor } from "react-colorful"
import styles from "./Home.module.css"
import "swiper/css"

const dragBar = 24
const sideBar = 24
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
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))
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
        function countdownDateHasChanged(_: unknown, data: DateList) {
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
                    <Content time={time} isUnlock={isUnlock} ref={contentRef} />
                </Box>
                <OperationBar
                    isFocus={isFocus}
                    isUnlock={isUnlock}
                    handleLock={handleLock}
                    swiperRef={contentRef}
                />
            </Box >
        </>
    )
}

function OperationBar({
    isFocus,
    isUnlock,
    swiperRef,
    handleLock
}: {
    isFocus: boolean
    isUnlock: boolean
    swiperRef: React.MutableRefObject<ContentRef>
    handleLock: (status?: boolean) => void
}) {
    const wrapperRef = useRef<HTMLDivElement>()
    const contentRef = useRef<HTMLDivElement>()
    const [isPlaying, setIsPlaying] = useState(true)
    const [showArrow, setShowArrow] = useState(false)
    const [isAlwaysTop, setIsAlwaysTop] = useState(window.ipcRenderer.getStore<boolean>("alwaysOnTop"))
    function onPrev() {
        swiperRef.current.swiperRef.slidePrev()
    }
    function onNext() {
        swiperRef.current.swiperRef.slideNext()
    }
    function onPaused() {
        const autoplay = swiperRef.current.swiperRef.autoplay
        if (isPlaying) autoplay.stop()
        else autoplay.start()
        setIsPlaying(!isPlaying)
    }
    function handleAlwaysTop() {
        const newStatus = !isAlwaysTop
        setIsAlwaysTop(newStatus)
        window.ipcRenderer.send("setAlwaysOnTop", newStatus)
    }

    useEffect(() => {
            function resize() {
                if (contentRef.current.offsetHeight > wrapperRef.current.offsetHeight) {
                    setShowArrow(true)
                } else {
                    setShowArrow(false)
                }
            }
            resize()
            window.addEventListener("resize", resize)
            return () => {
                window.removeEventListener("resize", resize)
            }
    }, [])
    
    return (
        <Box
            sx={{
                height: "100%",
                overflow: "auto"
            }}
            style={{
                display: isFocus ? "" : "none",
                width: sideBar
            }}
            ref={wrapperRef}
        >
            <Box ref={contentRef} sx={{ position: "relative" }}>
                <IconButton
                    className={styles.barItem}
                    onClick={() => handleLock()}
                    aria-label="lock or unlock the showing area."
                >
                    {isUnlock ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                </IconButton>
                <IconButton
                    className={styles.barItem}
                    onClick={handleAlwaysTop}
                    aria-label="put the area on the top of all the windows or the other way."
                >
                    {isAlwaysTop ? <NearMeIcon fontSize="small" /> : <NearMeOutlinedIcon fontSize="small" />}
                </IconButton>
                <IconButton
                    className={styles.barItem}
                    onClick={onPrev}
                    aria-hidden
                >
                    <KeyboardDoubleArrowUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                    className={styles.barItem}
                    onClick={onPaused}
                    aria-hidden
                >
                    {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>
                <IconButton
                    className={styles.barItem}
                    onClick={onNext}
                    aria-hidden
                >
                    <KeyboardDoubleArrowDownIcon fontSize="small" />
                </IconButton>
                <IconButton
                    className={styles.arrow}
                    style={{
                        display: showArrow ? "" : "none"
                    }}
                >
                    <ArrowDownwardIcon fontSize="inherit" />
                </IconButton>
            </Box>
        </Box >
    )
}
interface ContentProps {
    isUnlock: boolean
    time: TimeItem[]
}
interface ContentRef {
    swiperRef: SwiperClass
}

const Content = forwardRef<ContentRef, ContentProps>(function Content({
    isUnlock,
    time
}, ref) {
    const swiperRef = useRef<SwiperClass>()
    const [fontSize, setFontSize] = useState(window.ipcRenderer.getStore<number>("fontSize"))
    const [backgroundColor, setBackgroundColor] = useState(window.ipcRenderer.getStore<RgbaColor>("backgroundColor"))
    const [useGradientColor, setUseGradientColor] = useState(window.ipcRenderer.getStore<boolean>("useGradientColor"))
    const [gradientColorFrom, setGradientColorFrom] = useState(window.ipcRenderer.getStore<RgbaColor>("gradientColorFrom"))
    const [gradientColorTo, setGradientColorTo] = useState(window.ipcRenderer.getStore<RgbaColor>("gradientColorTo"))
    const contentRef = useRef<HTMLDivElement>()
    const backgroundColorString = useMemo(() => `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`, [backgroundColor])
    const gradientColorString = useMemo(() =>
        `linear-gradient(to right, 
        rgba(${gradientColorFrom.r},${gradientColorFrom.g},${gradientColorFrom.b},${gradientColorFrom.a}), 
        rgba(${gradientColorTo.r},${gradientColorTo.g},${gradientColorTo.b},${gradientColorTo.a}))`,
        [gradientColorFrom, gradientColorTo]
    )

    useImperativeHandle(ref, () => ({ swiperRef: swiperRef.current }), [])
    useEffect(() => {
        function fontSizeChanged(_: unknown, data: number) {
            setFontSize(data)
        }
        function backgroundChanged(_: unknown, data: RgbaColor) {
            setBackgroundColor(data)
        }
        function useGradientColorChanged(_: unknown, data: boolean) {
            setUseGradientColor(data)
        }
        function gradientColorFromChanged(_: unknown, data: RgbaColor) {
            setGradientColorFrom(data)
        }
        function gradientColorToChanged(_: unknown, data: RgbaColor) {
            setGradientColorTo(data)
        }
        swiperRef.current.autoplay.start()
        window.ipcRenderer.addListener("fontSizeHasChanged", fontSizeChanged)
        window.ipcRenderer.addListener("backgroundColorHasChanged", backgroundChanged)
        window.ipcRenderer.addListener("useGradientColorHasChanged", useGradientColorChanged)
        window.ipcRenderer.addListener("gradientColorFromHasChanged", gradientColorFromChanged)
        window.ipcRenderer.addListener("gradientColorToHasChanged", gradientColorToChanged)
        return () => {
            window.ipcRenderer.removeListener("fontSizeHasChanged", fontSizeChanged)
            window.ipcRenderer.removeListener("backgroundColorHasChanged", backgroundChanged)
            window.ipcRenderer.removeListener("useGradientColorHasChanged", useGradientColorChanged)
            window.ipcRenderer.removeListener("gradientColorFromHasChanged", gradientColorFromChanged)
            window.ipcRenderer.removeListener("gradientColorToHasChanged", gradientColorToChanged)
        }
    }, [])
    return (
        <Box
            className={styles.text}
            style={{ height: isUnlock ? `calc( 100% - ${dragBar}px )` : "100%" }}
            ref={contentRef}
        >
            <Swiper
                className={styles.swper}
                direction="vertical"
                speed={1000}
                onSwiper={(swiper) => swiperRef.current = swiper}
                modules={[Autoplay]}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
            >
                {
                    time.map(i => {
                        const line = (i.line && i.line !== "") ? i.line : (i.sign ? defaultLine : defaultLineReverse)
                        const s = line
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
                                <Box
                                    sx={{
                                        fontSize: fontSize + "px",
                                        background: useGradientColor ? gradientColorString : backgroundColorString,
                                        backgroundClip: "text",
                                        color: "transparent"
                                    }}
                                >
                                    {s}
                                </Box>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
        </Box>
    )
})