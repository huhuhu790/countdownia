import {
    Avatar, Box, Divider,
    IconButton, List, ListItem,
    Toolbar, Tooltip, Paper
} from "@mui/material"
import BeachAccessIcon from "@mui/icons-material/BeachAccess"
import { Outlet, useNavigate } from "react-router-dom"
import styles from "./layout.module.css"

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
                {["calendar"].map((text) => (
                    <ListItem key={text} sx={{ justifyContent: "center" }}>
                        <Tooltip title={text} placement="right">
                            <Avatar>
                                <IconButton color="inherit" onClick={() => nav(text)}>
                                    <BeachAccessIcon />
                                </IconButton>
                            </Avatar>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
            <Divider />
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
