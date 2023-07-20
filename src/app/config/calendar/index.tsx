import {
    AppBar, Box,
    Toolbar, Paper, List, ListItem, Divider, ListItemText, Typography, Button
} from "@mui/material"
import CalendarArea, { CalendarAreaRef } from "./CalendarArea"
import { Fragment, useEffect, useRef, useState } from "react"
import type { IpcRendererEvent } from "electron"
import FormDialog, { FormDialogRef } from "./FormDialog"
import dayjs from "dayjs"

const sideWidth = 280
const appBarHeight = 64

export default function CalendarPage() {
    const calendarAreaRef = useRef<CalendarAreaRef>()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))
    const formDialogRef = useRef<FormDialogRef>()

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
            <FormDialog ref={formDialogRef} />
            <Paper
                elevation={2}
                sx={{
                    width: sideWidth + "px",
                    height: "100%",
                    overflow: "auto"
                }}
            >
                <SideBar
                    countdownDate={countdownDate}
                    dayGridMonth={dayGridMonth}
                />
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
                        overflow: "auto"
                    }}
                >
                    <CalendarArea
                        ref={calendarAreaRef}
                        formDialogRef={formDialogRef}
                        countdownDate={countdownDate} />
                </Box>
            </Paper >
        </Box>
    )
}

function SideBar({
    countdownDate,
    dayGridMonth
}: {
    countdownDate: DateList
    dayGridMonth: CalendarAreaRef["dayGridMonth"]
}) {
    return (
        <>
            <Toolbar>
            </Toolbar>
            <Box sx={{ cursor: "pointer" }}>
                <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper", padding: 0 }}>
                    {
                        countdownDate.map(i => {
                            const dateStart = dayjs(i.date)
                            const startHour = dateStart.hour()
                            const start = dateStart.format("YYYY-MM-DD") + (startHour > 0 ? `/${startHour}H` : "")
                            let end = ""
                            if (i.endDate) {
                                const dateEnd = dayjs(i.endDate)
                                const endHour = dateEnd.hour()
                                end = dateEnd.format("YYYY-MM-DD") + (endHour > 0 ? `/${dateEnd}H` : "")
                            }
                            return (
                                <Fragment key={i.id}>
                                    <ListItem alignItems="flex-start" onClick={() => dayGridMonth(new Date(i.date))}>
                                        <ListItemText
                                            primary={i.title}
                                            primaryTypographyProps={{ noWrap: true }}
                                            secondaryTypographyProps={{ component: "div" }}
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.primary"
                                                        noWrap
                                                    >
                                                        {i.description ?? "..."}
                                                    </Typography>
                                                    {end ? `${start} To ${end}` : start}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider />
                                </Fragment>
                            )
                        })
                    }
                </List>
            </Box>
        </>
    )
}