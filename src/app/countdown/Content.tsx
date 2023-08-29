
import { Box } from "@mui/material"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Autoplay } from "swiper/modules"
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react"
import type { RgbaColor } from "react-colorful"
import "swiper/css"

const defaultLine = "距离$title还有$d天$h时$m分$s秒"
const defaultLineReverse = "距离$title已过去$d天$h时$m分$s秒"

export interface TimeGroup {
    day: number
    hour: number
    minute: number
    seconds: number
}


export interface TimeItem extends EventItem {
    sign: boolean
    timeGroup: TimeGroup
    endTimeGroup?: TimeGroup
}


interface ContentProps {
    isUnlock: boolean
    time: TimeItem[]
    dragBar: number
}
export interface ContentRef {
    swiperRef: SwiperClass
}

export default forwardRef<ContentRef, ContentProps>(function Content({
    isUnlock,
    time,
    dragBar
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
            sx={{
                userSelect: "none",
                width: "100%"
            }}
            style={{ height: isUnlock ? `calc( 100% - ${dragBar}px )` : "100%" }}
            ref={contentRef}
        >
            <Swiper
                style={{
                    height: "100%"
                }}
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
                                style={{
                                    overflow: "hidden",
                                    lineBreak: "anywhere"
                                }}
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