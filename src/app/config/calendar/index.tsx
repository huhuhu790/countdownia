import {
    Box,
    List, ListItem,
    ListItemButton, ListItemText,
    SpeedDial,
    SpeedDialAction,
    Typography
} from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined"
import Calendar, { CalendarRef } from "./Calendar"
import { DIALOG_NAMES, DIALOG_Sizes } from "@/utils/dialogNames"

export default function CalendarPage() {
    const calendarRef = useRef<CalendarRef>()
    const anchorItem = useRef<HTMLDivElement>()
    const [countdownDate, setCountdownDate] = useState(window.ipcRenderer.getStore<EventList>("countdownDate"))

    const actions = useMemo(() => [
        {
            icon: <AddCircleOutlineOutlinedIcon />,
            name: "Add Event",
            event() {
                const type = DIALOG_NAMES.CONFIG_FORM
                const size = DIALOG_Sizes[type]
                window.ipcRenderer.send("openDialog",
                    {
                        type,
                        ...size,
                        info: event
                    })
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
    ].map((action) => (
        <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.event}
        />
    )), [])

    useEffect(() => {
        function countdownDateHasChanged(_: unknown, data: EventList) {
            setCountdownDate(data)
        }
        window.ipcRenderer.addListener("countdownDateHasChanged", countdownDateHasChanged)
        return () => {
            window.ipcRenderer.removeListener("countdownDateHasChanged", countdownDateHasChanged)
        }
    }, [])

    function jumpToDay(value: number) {
        calendarRef.current.jumpToDay(value)
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
                    flex: 1,
                    maxWidth: 320,
                    minWidth: 240,
                    height: "100%",
                    overflow: "auto"
                }}
            >
                <SideBar
                    countdownDate={countdownDate}
                    jumpToDay={jumpToDay}
                />
            </Box>
            <Box
                sx={{
                    flex: 1,
                    minWidth: 750,
                    overflow: "auto",
                    p: 1,
                    pb: 12,
                }}
            >
                <Box ref={anchorItem} />
                <Calendar ref={calendarRef} countdownDate={countdownDate} />
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
                {actions}
            </SpeedDial>
        </Box>
    )
}

function SideBar({
    countdownDate,
    jumpToDay
}: {
    countdownDate: EventList
    jumpToDay: (value: number) => void
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
                                        jumpToDay(i.date)
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