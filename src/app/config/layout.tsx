import {
    Avatar, Box, Divider,
    IconButton, List, ListItem,
    Tooltip
} from "@mui/material"
import EventNoteIcon from "@mui/icons-material/EventNote"
import BeachAccessIcon from "@mui/icons-material/BeachAccess"
import { Outlet, useNavigate } from "react-router-dom"
import styles from "./layout.module.css"
import { Fragment } from "react"

const drawerWidth = 80

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
function Drawer() {
    const nav = useNavigate()
    return (
        <Box
            sx={{
                width: drawerWidth + "px",
                height: "100%",
                overflow: "auto"
            }}
        >
            <List>
                {
                    list.map(i => (
                        <Fragment key={i.name}>
                            <ListItem sx={{ justifyContent: "center" }}>
                                <Tooltip title={i.name} placement="right">
                                    <Avatar>
                                        <IconButton color="inherit" onClick={() => nav(i.route)}>
                                            {i.icon}
                                        </IconButton>
                                    </Avatar>
                                </Tooltip>
                            </ListItem>
                        </Fragment>
                    ))
                }
            </List>
        </Box>
    )
}

export default function HomePage() {
    return (
        <>
            <DragBar />
            <Box
                sx={{
                    display: "flex",
                    height: "calc(100vh - env(titlebar-area-height, var(--fallback-title-bar-height)))"
                }}
            >
                <Drawer />
                <Box sx={{ flex: 1 }} >
                    <Outlet />
                </Box>
            </Box >
        </>
    )
}
