import { Box, Fab, Fade, useScrollTrigger } from "@mui/material"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import { useEffect, useState } from "react"

interface ScrollTopProps {
    bottom: number
    right: number
    el: React.MutableRefObject<HTMLDivElement>
    position?: React.CSSProperties["position"]
}

export default function ScrollTop({ bottom, right, el, position }: ScrollTopProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        function scroll() {
            if (el.current.scrollTop > 10) setShow(true)
            else setShow(false)
        }
        el.current?.addEventListener("scroll", scroll)
        return () => {
            el.current?.removeEventListener("scroll", scroll)
        }
    }, [])

    const handleClick = () => {
        const item = el.current.querySelector("#scroll-into")
        if (item)
            item.scrollIntoView({
                block: "center",
                behavior: "smooth"
            })
    }

    return (
        <Fade in={show}>
            <Box
                component="div"
                onClick={handleClick}
                role="presentation"
                sx={{
                    position: position ?? "fixed",
                    zIndex: 10
                }}
                style={{ bottom, right }}
            >
                <Fab size="small">
                    <KeyboardArrowUpIcon />
                </Fab>
            </Box>
        </Fade>
    )
}