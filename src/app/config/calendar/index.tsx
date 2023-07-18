import {
    AppBar, Box,
    Toolbar, Paper
} from "@mui/material"
import CalendarArea, { CalendarAreaRef } from "./CalendarArea";
import { useEffect, useRef, useState } from "react";
import type { IpcRendererEvent } from "electron"

const sideWidth = 280
const appBarHeight = 64

export default function CalendarPage() {
    const calendarAreaRef = useRef<CalendarAreaRef>()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))

    useEffect(() => {
        function countdownDateHasChanged(e: IpcRendererEvent, data: DateList) {
            setCountdownDate(data)
        }
        window.ipcRenderer.addListener("countdownDateHasChanged", countdownDateHasChanged)
        return () => {
            window.ipcRenderer.removeListener("countdownDateHasChanged", countdownDateHasChanged)
        }
    }, [])

    function dayGridMonth(date: Date) {
        calendarAreaRef.current.dayGridMonth(date)
    }

    return (
        <Box
            sx={{
                display: "flex",
                height: "100%"
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    width: sideWidth + "px",
                    height: "100%",
                    overflow: 'auto'
                }}
            >
                <SideBar countdownDate={countdownDate} dayGridMonth={dayGridMonth} />
            </Paper>
            <Paper
                elevation={2}
                sx={{
                    flex: 1,
                    position: "relative"
                }}
            >
                <AppBar
                    position="sticky"
                    sx={{
                        height: appBarHeight
                    }}
                >
                    <Toolbar ></Toolbar>
                </AppBar>
                <Box
                    sx={{
                        width: "100%",
                        height: `calc(100% - ${appBarHeight}px)`,
                        overflow: 'auto'
                    }}
                >
                    <CalendarArea ref={calendarAreaRef} countdownDate={countdownDate} />
                </Box>
            </Paper >
        </Box>
    );
}

function SideBar({ countdownDate,
    dayGridMonth
}: {
    countdownDate: DateList
    dayGridMonth: CalendarAreaRef["dayGridMonth"]
}) {
    return (
        <>
            <Toolbar></Toolbar>
            <Box sx={{ cursor: "pointer" }}>
                {
                    countdownDate.map(i => (
                        <Box onClick={() => dayGridMonth(new Date(i.date))} key={i.id}>
                            {i.date}
                        </Box>
                    ))
                }
            </Box>
        </>
    )
}