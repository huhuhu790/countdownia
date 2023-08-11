import { Box, IconButton, styled } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import LockIcon from "@mui/icons-material/Lock"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import NearMeIcon from "@mui/icons-material/NearMe"
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown"
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { ContentRef } from "./Content"
const minHeight = 140
const Button = styled(IconButton)`
    height: 24px;
    padding: 0;
    width: 100%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
`

export default function OperationBar({
    isFocus,
    isUnlock,
    swiperRef,
    handleLock,
    sideBar
}: {
    isFocus: boolean
    isUnlock: boolean
    swiperRef: React.MutableRefObject<ContentRef>
    handleLock: (status?: boolean) => void
    sideBar: number
}) {
    const wrapperRef = useRef<HTMLDivElement>()
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
        if (isFocus) {
            function resize() {
                setShowArrow(wrapperRef.current.offsetHeight <= minHeight)
            }
            resize()
            window.addEventListener("resize", resize)
            return () => {
                window.removeEventListener("resize", resize)
            }
        }
    }, [isFocus])

    useEffect(() => {
        window.ipcRenderer.addListener("previous", onPrev)
        window.ipcRenderer.addListener("changePlayingMode", onPaused)
        window.ipcRenderer.addListener("next", onNext)
        return () => {
            window.ipcRenderer.removeListener("previous", onPrev)
            window.ipcRenderer.removeListener("changePlayingMode", onPaused)
            window.ipcRenderer.removeListener("next", onNext)
        }
    }, [])

    return (
        <Box
            sx={{
                height: "100%",
                overflow: "auto",
                width: sideBar,
                position: "relative",
                display: isFocus ? "" : "none"
            }}
            ref={wrapperRef}
        >
            <Box>
                <Button onClick={() => handleLock()} >
                    {isUnlock ? <LockOpenIcon fontSize="small" color="inherit" /> : <LockIcon fontSize="small" color="inherit" />}
                </Button>
                <Button onClick={handleAlwaysTop} >
                    {isAlwaysTop ? <NearMeIcon fontSize="small" /> : <NearMeOutlinedIcon fontSize="small" />}
                </Button>
                {
                    showArrow ? null :
                        <>
                            <Button onClick={onPrev}>
                                <KeyboardDoubleArrowUpIcon fontSize="small" />
                            </Button>
                            <Button onClick={onPaused} >
                                {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                            </Button>
                            <Button onClick={onNext} >
                                <KeyboardDoubleArrowDownIcon fontSize="small" />
                            </Button>
                        </>
                }
            </Box>
            <Button
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    fontSize: 12,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    display: showArrow ? "flex" : "none"
                }}
                onClick={() => window.ipcRenderer.send("showMoreContextMenu")}
            >
                <MoreHorizIcon fontSize="small" />
            </Button>
        </Box >
    )
}