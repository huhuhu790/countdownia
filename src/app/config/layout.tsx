import {
    Avatar, Box, Divider,
    IconButton, List, ListItem,
    Toolbar, Tooltip, Paper
} from "@mui/material"
import EventNoteIcon from "@mui/icons-material/EventNote"
import BeachAccessIcon from "@mui/icons-material/BeachAccess"
import { Outlet, useNavigate } from "react-router-dom"
import styles from "./layout.module.css"
import { Fragment } from "react"

const drawerWidth = 80

function DragBar({ children }: { children?: React.ReactNode }) {
    return (
        <div className={styles.titleBarContainer}>
            <div className={`${styles.titleBar} draggable`}>
                {children}
            </div>
        </div>
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
        <Paper
            sx={{
                width: drawerWidth + "px",
                height: "100%",
                overflow: "auto"
            }}
        >
            <Toolbar >
            </Toolbar>
            <Divider />
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
                            <Divider />
                        </Fragment>
                    ))
                }
            </List>
        </Paper>
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
