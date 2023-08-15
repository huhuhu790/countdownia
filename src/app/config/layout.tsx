import {
    Avatar, Box,
    Drawer,
    IconButton, List, ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@mui/material"
import EventNoteIcon from "@mui/icons-material/EventNote"
import BeachAccessIcon from "@mui/icons-material/BeachAccess"
import { Outlet, useNavigate } from "react-router-dom"
import styles from "./layout.module.css"
import { useMemo } from "react"
import MenuIcon from "@mui/icons-material/Menu"
import { useAtom } from "jotai"
import { openDrawer } from "./jotai/atoms"

const minScreenSizeAllowOpen = 1400
const openWidth = 280
const shrinkWidth = 88
const backgroundColor = "#254B85"

function DragBar({ children }: { children?: React.ReactNode }) {
    return (
        <Box
            className={styles.titleBarContainer}
            onContextMenu={e => e.preventDefault}
        >
            <Box className={`${styles.titleBar} draggable`}>
                {children}
            </Box>
        </Box>
    )
}

const list = [
    {
        name: "calendar",
        route: "/",
        icon: <EventNoteIcon />
    },
    {
        name: "options",
        route: "/options",
        icon: <BeachAccessIcon />
    }
]

function CustomDrawer({
    matches,
    openStatus,
    width,
    changeDrawerOpen
}: {
    matches: boolean
    openStatus: boolean
    width: number
    changeDrawerOpen: () => void
}) {
    const nav = useNavigate()
    const { transitions, palette } = useTheme()
    const transition = useMemo(() => transitions.create("width", {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
    }), [transitions])

    return (
        <Drawer
            variant="permanent"
            sx={{
                flexShrink: 0,
                height: "100%",
                width,
                transition,
                "& .MuiDrawer-paper": {
                    position: "initial",
                    border: "none",
                    bgcolor: palette.background.default
                }
            }}
        >
            <Toolbar
                sx={{
                    display: matches ? "flex" : "none",
                    justifyContent: "flex-end"
                }}
            >
                <IconButton onClick={changeDrawerOpen}>
                    <MenuIcon />
                </IconButton>
            </Toolbar>
            <List>
                {
                    list.map(i => (
                        <ListItem sx={{ justifyContent: "center" }} key={i.name}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: openStatus ? "initial" : "center",
                                    px: 2.5,
                                }}
                                onClick={() => nav(i.route)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: openStatus ? 3 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Tooltip title={i.name} placement="right" disableHoverListener={openStatus}>
                                        <Avatar>
                                            {i.icon}
                                        </Avatar>
                                    </Tooltip>
                                </ListItemIcon>
                                <ListItemText primary={i.name} sx={{ display: openStatus ? "" : "none" }} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
        </Drawer>
    )
}

export default function HomePage() {
    const matches = useMediaQuery(`@media (min-width:${minScreenSizeAllowOpen}px)`)
    const { palette } = useTheme()
    const [open, setOpen] = useAtom(openDrawer)
    const openStatus = useMemo(() => {
        return open && matches
    }, [open, matches])
    const width = useMemo(() => {
        return openStatus ? openWidth : shrinkWidth
    }, [openStatus])
    function changeDrawerOpen() {
        setOpen(!open)
    }
    return (
        <>
            <DragBar />
            <Box
                sx={{
                    display: "flex",
                    height: "calc(100vh - env(titlebar-area-height, var(--fallback-title-bar-height)))",
                    "*::-webkit-scrollbar": {
                        width: "12px",
                        height: "12px"
                    },
                    "*::-webkit-scrollbar-track": {
                        backgroundColor: "rgb(0 0 0 / 40%)",
                        borderRadius: "20px"
                    },
                    "*::-webkit-scrollbar-thumb": {
                        bgcolor: `primary.${palette.mode}`,
                        borderRadius: "20px"
                    }
                }}
            >
                <CustomDrawer
                    changeDrawerOpen={changeDrawerOpen}
                    matches={matches}
                    width={width}
                    openStatus={openStatus}
                />
                <Box sx={{ width: `calc( 100% - ${width}px)` }}>
                    <Outlet />
                </Box>
            </Box >
        </>
    )
}
