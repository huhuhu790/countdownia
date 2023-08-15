import {
    Box,
    List, ListItem,
    ListItemButton, ListItemText,
    SpeedDial,
    SpeedDialAction,
    Typography
} from "@mui/material"
import CalendarArea, { CalendarAreaRef } from "./CalendarArea"
import { useEffect, useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined"

export default function CalendarPage() {
    const calendarAreaRef = useRef<CalendarAreaRef>()
    const anchorItem = useRef<HTMLDivElement>()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<DateList>("countdownDate"))

    const actions = useMemo(() => [
        {
            icon: <AddCircleOutlineOutlinedIcon />,
            name: "Add",
            event() {
                calendarAreaRef.current.onEventAdd()
            }
        },
        {
            icon: <KeyboardArrowUpOutlinedIcon />,
            name: "Back to top",
            event() {
                anchorItem.current.scrollIntoView({
                    block: "center",
                    behavior: "smooth"
                })
            }
        }
    ], [])

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
                position: "relative",
            }}
        >
            <Box
                sx={{
                    flex: 3,
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
                    flex: 7,
                    overflow: "auto",
                    p: 1,
                    pb: 12,
                }}
            >
                <Box ref={anchorItem} />
                <CalendarArea
                    ref={calendarAreaRef}
                    countdownDate={countdownDate} />
            </Box >
            <SpeedDial
                sx={{
                    position: "absolute",
                    bottom: 24,
                    right: 24,
                }}
                ariaLabel="SpeedDial"
                hidden={false}
                icon={<SpeedDialIcon />}
                direction="left"
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.event}
                    />
                ))}
            </SpeedDial>
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