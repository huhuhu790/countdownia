import {
    Card, Box,
    Button, ButtonGroup,
    Typography,
    useTheme,
    Popper,
    Grow,
    Paper,
    ClickAwayListener,
    MenuList,
    MenuItem,
    Divider
} from "@mui/material"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { EventClickArg, EventContentArg } from "@fullcalendar/core"
import EventNoteIcon from "@mui/icons-material/EventNote"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import "./CalendarArea.scss"
import { FormDialogRef } from "./FormDialog"

const options = ["Month View", "Day View"];
export interface CalendarAreaRef {
    dayGridMonth: (date?: Date) => void
}

function EventContent({ arg }: { arg: EventContentArg }) {
    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                "&:hover": {
                    color: "rgb(79 70 229)",
                    "& .eventTime": {
                        color: "rgb(79 70 229)"
                    }
                }
            }}
        >
            <Typography
                sx={{
                    flex: "1 1 auto",
                    fontWeight: 500,
                    fontSize: "1rem",
                    lineBreak: arg.view.type === "dayGridMonth" ? "" : "anywhere"
                }}
                noWrap={arg.view.type === "dayGridMonth"}
            >
                {arg.event.title}
            </Typography>
            {
                arg.view.type === "dayGridMonth" && !arg.event._def.extendedProps.endDate ?
                    <Box
                        sx={{
                            flex: "none",
                            marginLeft: "0.75rem",
                            color: "rgb(107 114 128)",
                            fontSize: "1rem"
                        }}
                        className="eventTime"
                    >
                        {arg.event.start.getHours()}H
                    </Box> : null
            }
        </Box>
    )
}

function SplitButton({
    dayGridMonth,
    timeGridDay,
    selectedIndex,
    setSelectedIndex
}: {
    dayGridMonth: () => void
    timeGridDay: () => void
    selectedIndex: number
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
}) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        if (index === 0) dayGridMonth()
        else timeGridDay()
        setSelectedIndex(index)
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <>
            <ButtonGroup disableRipple variant="contained" ref={anchorRef} sx={{ "& button": { border: "none!important" } }}>
                <Button autoCapitalize="false">{options[selectedIndex]}</Button>
                <Button
                    size="small"
                    sx={{ padding: 0 }}
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 10,
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option}
                                            disabled={index === 2}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

interface Props {
    fullCalendarRef: React.MutableRefObject<FullCalendar>
    onEventAdd: () => void
}
interface Ref {
    dayGridMonth: (date?: Date) => void
    timeGridDay: (date?: Date) => void
}

const CalendarToolBar = forwardRef<Ref, Props>(function CalendarToolBar({
    fullCalendarRef,
    onEventAdd
}, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [date, setDate] = useState(new Date())
    const [showDay, setShowDay] = useState(false)
    const { palette } = useTheme()
    const dateString = useMemo(() => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return showDay ?
            `${year}年${month}月${day}日` :
            `${year}年${month}月`
    }, [date, showDay])
    const weekString = useMemo(() => {
        const week = date.getDay()
        let weekString = ""
        switch (week) {
            case 1:
                weekString = "一"
                break;
            case 2:
                weekString = "二"
                break;
            case 3:
                weekString = "三"
                break;
            case 4:
                weekString = "四"
                break;
            case 5:
                weekString = "五"
                break;
            case 6:
                weekString = "六"
                break;
            case 7:
                weekString = "日"
                break;
        }
        return weekString
    }, [date])

    useImperativeHandle(ref,
        () => ({
            dayGridMonth,
            timeGridDay
        }), []
    )

    function dayGridMonth(date?: Date) {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.changeView("dayGridMonth", date)
        calendarApi.updateSize()

        setSelectedIndex(0)
        setShowDay(false)
        setDate(calendarApi.getDate())
    }

    function timeGridDay(date?: Date) {
        const calendarApi = fullCalendarRef.current.getApi()
        calendarApi.changeView("timeGridDay", date)

        setSelectedIndex(1)
        setShowDay(true)
        setDate(calendarApi.getDate())
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

    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                padding: 2
            }}
            style={{
                background: palette.mode === "dark" ? "rgb(37 40 42)" : "rgb(249 250 251)"
            }}
        >
            <Box flex={1}>
                <Typography >
                    {dateString}
                </Typography>
                {
                    showDay ?
                        <Typography
                            sx={{
                                color: "rgb(107 114 128)",
                                fontSize: "0.875rem"
                            }}
                        >
                            星期{weekString}
                        </Typography> : null
                }
            </Box>
            <ButtonGroup
                variant="contained"
                sx={{
                    mr: 4,
                    "& button": { border: "none!important" }
                }}>
                <Button onClick={prevYear} sx={{ padding: 0 }}>
                    <KeyboardDoubleArrowLeftIcon />
                </Button>
                <Button onClick={prev} sx={{ padding: 0 }}>
                    <KeyboardArrowLeftIcon />
                </Button>
                <Button onClick={today} autoCapitalize="false">
                    Today
                </Button>
                <Button onClick={next} sx={{ padding: 0 }}>
                    <KeyboardArrowRightIcon />
                </Button>
                <Button onClick={nextYear} sx={{ padding: 0 }}>
                    <KeyboardDoubleArrowRightIcon />
                </Button>
            </ButtonGroup>

            <SplitButton
                dayGridMonth={dayGridMonth}
                timeGridDay={timeGridDay}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
            />

            <Divider orientation="vertical" sx={{ mx: 4, height: 32 }} light />

            <Button onClick={onEventAdd} variant="contained" color="secondary">
                Add Event
            </Button>
        </Box >
    )
})

export default forwardRef<CalendarAreaRef, {
    countdownDate: DateList
    formDialogRef: React.MutableRefObject<FormDialogRef>
}
>(function CalendarArea({
    countdownDate,
    formDialogRef
}, ref) {
    const { palette } = useTheme()
    const fullCalendarRef = useRef<FullCalendar>()
    const CalendarToolBarRef = useRef<Ref>()
    function onDateClick(date: Date, jsEvent: UIEvent) {
        CalendarToolBarRef.current.timeGridDay(date)
    }

    function onEventClick(info: EventClickArg) {
        info.jsEvent.preventDefault()
        info.jsEvent.stopPropagation()
        formDialogRef.current.openDialog(false, info.event._def)
    }

    function onEventAdd() {
        formDialogRef.current.openDialog(true)
    }

    useImperativeHandle(
        ref,
        () => ({
            dayGridMonth: CalendarToolBarRef.current.dayGridMonth
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
            sx={{
                px: 2,
                pt: 4,
                pb: 8,
                minHeight: "100%",
            }}
        >
            <Box
                sx={{
                    borderRadius: 2,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    overflow: "hidden"
                }}
                style={{
                    borderColor: palette.mode === "dark" ? "#121212" : "rgb(209 213 219)"
                }}
            >
                <CalendarToolBar
                    ref={CalendarToolBarRef}
                    onEventAdd={onEventAdd}
                    fullCalendarRef={fullCalendarRef}
                />
                <FullCalendar
                    ref={fullCalendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={false}
                    eventContent={(arg: EventContentArg) => <EventContent arg={arg} />}
                    height="auto"
                    initialView="dayGridMonth"
                    navLinkDayClick={onDateClick}
                    allDayContent={() => <EventNoteIcon />}
                    selectable
                    navLinks
                    nowIndicator
                    eventTimeFormat={{ // like "14:30:00"
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        meridiem: false
                    }}
                    eventClick={onEventClick}
                    events={events}
                />
            </Box>
        </Card>
    )
})