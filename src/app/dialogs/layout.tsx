import {
    Box,
    Paper
} from "@mui/material"

const dragBar = 24

function DragBar() {
    return (
        <Box
            className="draggable"
            onContextMenu={e => e.preventDefault}
            sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: dragBar + "px",
                backdropFilter: "brightness(0.8)",
                display: "flex",
                alignItems: "center"
            }}
        >
            <Box sx={{ flexGrow: 1 }}></Box>
        </Box>
    )
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Paper
            elevation={3}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "calc( 100% - 16px)",
                position: "relative",
                margin: 1,
                pt: 3,
            }}
        >
            <DragBar />
            {children}
        </Paper >
    )
}
