import {
    Card, Box,
    Button, ButtonGroup,
    Typography
} from "@mui/material"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from "@fullcalendar/interaction"
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react"
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { EventClickArg } from "@fullcalendar/core"
import FormDialog, { FormDialogRef } from "./FormDialog"
import "./CalendarArea.scss"

function getDateString(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return {
        year, month, day
    }
}

export interface CalendarAreaRef {
    dayGridMonth: (date?: Date) => void
}

export default forwardRef<CalendarAreaRef, {
    countdownDate: DateList
}
>(function CalendarArea({
    countdownDate
}, ref) {
    const [date, setDate] = useState(new Date())
    const [showDay, setShowDay] = useState(false)
    const fullCalendarRef = useRef<FullCalendar>()
    const formDialogRef = useRef<FormDialogRef>()

    const dateString = useMemo(() => {
        const dateT = getDateString(date)
        return showDay ?
            `${dateT.year}年${dateT.month}月${dateT.day}日` :
            `${dateT.year}年${dateT.month}月`
    }, [date, showDay])

    function onDateClick(date: Date, jsEvent: UIEvent) {
        timeGridDay(date)
    }

    function onEventClick(info: EventClickArg) {
        info.jsEvent.preventDefault()
        info.jsEvent.stopPropagation()
        formDialogRef.current.openDialog(false, info.event._def)
    }

    function onEventAdd() {
        formDialogRef.current.openDialog(true)
    }

    function prevYear() {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.prevYear()
        setDate(calendarApi.getDate())
    }
    function prev() {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.prev()
        setDate(calendarApi.getDate())
    }
    function next() {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.next()
        setDate(calendarApi.getDate())
    }
    function nextYear() {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.nextYear()
        setDate(calendarApi.getDate())
    }

    function today() {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.today()
        setDate(calendarApi.getDate())
    }
    function dayGridMonth(date?: Date) {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.changeView("dayGridMonth", date)
        calendarApi.updateSize()

        setShowDay(false)
        setDate(calendarApi.getDate())
    }
    function timeGridDay(date?: Date) {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.changeView("timeGridDay", date)
        setShowDay(true)
        setDate(calendarApi.getDate())
    }
    useImperativeHandle(
        ref,
        () => ({
            dayGridMonth
        }),
        []
    )
    const events = useMemo(() => countdownDate.map(i => ({
        id: i.id,
        title: i.title,
        start: i.date,
        end: i.endDate,
        allDay: i.endDate ? false : true,
        display: i.endDate ? undefined : "list-item",
        extendedProps: i
    })), [countdownDate])

    return (
        <Card
            // onContextMenu={() => {
            //     window.ipcRenderer.send('show-context-menu')
            // }}
            sx={{
                padding: 2,
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <FormDialog ref={formDialogRef} />
            <Box display="flex" alignItems="center">
                <ButtonGroup variant="contained">
                    <Button onClick={() => dayGridMonth()}>
                        Month
                    </Button>
                    <Button onClick={() => timeGridDay()}>
                        Day
                    </Button>
                </ButtonGroup>
                <Button onClick={onEventAdd}>
                    Add
                </Button>
                <Typography flex={1} textAlign="center">{dateString}</Typography>
                <ButtonGroup variant="contained">
                    <Button onClick={prevYear}>
                        <KeyboardDoubleArrowLeftIcon />
                    </Button>
                    <Button onClick={prev}>
                        <KeyboardArrowLeftIcon />
                    </Button>
                    <Button onClick={today}>
                        today
                    </Button>
                    <Button onClick={next}>
                        <KeyboardArrowRightIcon />
                    </Button>
                    <Button onClick={nextYear}>
                        <KeyboardDoubleArrowRightIcon />
                    </Button>
                </ButtonGroup>
            </Box>
            <FullCalendar
                ref={fullCalendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={false}
                height="auto"
                initialView='dayGridMonth'
                navLinkDayClick={onDateClick}
                selectable
                navLinks
                nowIndicator
                eventTimeFormat={{ // like '14:30:00'
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    meridiem: false
                }}
                eventClick={onEventClick}
                events={events}
            />
        </Card>
    )
})