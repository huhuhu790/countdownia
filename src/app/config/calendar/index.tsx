import {
    Box, List, ListItem, ListItemButton, ListItemText, Typography
} from "@mui/material"
import CalendarArea, { CalendarAreaRef } from "./CalendarArea"
import { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import ScrollTop from "@/components/ScrollTop"

const sideWidth = 280

export default function CalendarPage() {
    const calendarAreaRef = useRef<CalendarAreaRef>()
    const parentRef = useRef<HTMLDivElement>()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))

    useEffect(() => {
        function countdownDateHasChanged(_: unknown, data: DateList) {
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
                height: "100%",
                width: "100%",
            }}
        >
            <Box
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
            </Box>
            <Box
                sx={{
                    flex: 1,
                    position: "relative"
                }}
            >
                <Box
                    ref={parentRef}
                    sx={{
                        width: "100%",
                        height: "100%",
                        overflow: "auto"
                    }}
                >
                    <div id="scroll-into"></div>
                    <CalendarArea
                        ref={calendarAreaRef}
                        countdownDate={countdownDate} />
                </Box>
                <ScrollTop bottom={12} right={24} el={parentRef} position="absolute" />
            </Box >
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
        <Box sx={{ cursor: "pointer" }}>
            <List sx={{ width: "100%", maxWidth: 360, padding: 0 }}>
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
                            <ListItem key={i.id} >
                                <ListItemButton
                                    alignItems="flex-start"
                                    onClick={() => {
                                        dayGridMonth(new Date(i.date))
                                        location.hash = i.id
                                    }}
                                >
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
                                </ListItemButton>
                            </ListItem>
                        )
                    })
                }
            </List>
        </Box>
    )
}