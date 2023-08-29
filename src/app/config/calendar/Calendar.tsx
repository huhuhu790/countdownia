import {
    Box, Button, ButtonGroup, Card, CardActionArea, CardContent, ClickAwayListener, Grow,
    MenuItem, MenuList, Paper, Popper, Typography, styled, useTheme
} from "@mui/material"
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo, useRef, useState
} from "react"
import dayjs, { Dayjs } from "dayjs"
import calendarData from "./calendarData"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { DIALOG_NAMES, DIALOG_Sizes } from "@/utils/dialogNames"
import styles from "./Calendar.module.scss"
import "dayjs/locale/zh-cn"
dayjs.locale("zh-cn")

const background = {
    light: "rgb(249 250 251)",
    dark: "rgb(37 40 42)"
}

const weekColor = "rgb(107 114 128)"

function ViewButton({
    isMonthView,
    setView
}: {
    isMonthView: boolean
    setView: (isMonthView: boolean) => void
}) {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef<HTMLDivElement>(null)
    const selectedIndex = useMemo(() => isMonthView ? 0 : 1, [isMonthView])
    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setView(index === 0)
        setOpen(false)
    }

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) return
        setOpen(false)
    }

    return (
        <>
            <ButtonGroup disableRipple variant="contained" ref={anchorRef} sx={{ "& button": { border: "none!important" } }}>
                <Button
                    autoCapitalize="false"
                >
                    {calendarData.view_name["zh"][selectedIndex]}
                </Button>
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
                                placement === "bottom" ? "center top" : "center bottom",
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {calendarData.view_name["zh"].map((option, index) => (
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
    )
}

function OptionBar({
    date,
    isMonthView,
    setIsMonthView,
    prevDay,
    nextDay,
    prevMonth,
    nextMonth,
    prevYear,
    nextYear,
    today
}: {
    date: Dayjs
    isMonthView: boolean
    setIsMonthView: (value: boolean) => void
    prevDay: () => void
    nextDay: () => void
    prevMonth: () => void
    nextMonth: () => void
    prevYear: () => void
    nextYear: () => void
    today: () => void
}) {
    const { palette } = useTheme()
    const dateString = useMemo(() => date.format("YYYY年MM月DD日"), [date])
    const weekString = useMemo(() => {
        let week = date.get("day") - 1
        week = week < 0 ? 6 : week
        return calendarData.week_name["zh"][week]
    }, [date])

    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                padding: 2
            }}
            style={{
                background: background[palette.mode]
            }}
        >
            <Box flex={1}>
                <Typography >
                    {dateString}
                </Typography>
                <Typography
                    sx={{
                        color: weekColor,
                        fontSize: "0.875rem"
                    }}
                >
                    星期{weekString}
                </Typography>
            </Box>
            <ButtonGroup
                variant="contained"
                sx={{
                    mr: 4,
                    "& button": { border: "none!important" }
                }}>
                <Button
                    onClick={prevYear}
                >
                    <KeyboardDoubleArrowLeftIcon />
                </Button>
                <Button
                    onClick={prevMonth}
                >
                    <KeyboardArrowLeftIcon />
                </Button>
                <Button
                    onClick={today}
                >
                    {calendarData.today_name.zh}
                </Button>
                <Button
                    onClick={nextMonth}
                >
                    <KeyboardArrowRightIcon />
                </Button>
                <Button
                    onClick={nextYear}
                >
                    <KeyboardDoubleArrowRightIcon />
                </Button>
            </ButtonGroup>

            {/* <ViewButton
                setView={setIsMonthView}
                isMonthView={isMonthView}
            /> */}
        </Box >
    )
}

const Week = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    text-align:center;
`

const Day = styled(Box)`
    width: calc( 100% / 7 );
    min-height: 96px;
    position:relative;
`

const Title = styled(Box)`
    width: calc( 100% / 7 );
`

function getDayColor(item: dateItem) {
    switch (true) {
        case item.isToday:
            return styles.today
        case item.isInPrevMonth:
            return styles.prevMonth
        case item.isInCurrentMonth:
            return styles.currentMonth
        case item.isInNextMonth:
            return styles.nextMonth
    }
}

interface dateItem {
    date: Dayjs
    isInPrevMonth: boolean
    isInCurrentMonth: boolean
    isInNextMonth: boolean
    isToday: boolean
}

function buildDate({
    showStart,
    startGap,
    endGap,
    count
}: {
    showStart: Dayjs
    startGap: number
    endGap: number
    count: number
}) {
    const todayString = dayjs().format("DDMMYYYY")
    const dateList: dateItem[] = []
    let startDay = dayjs(showStart)
    let dateString = startDay.format("DDMMYYYY")
    do {
        const item = {
            date: startDay.clone(),
            isInPrevMonth: false,
            isInCurrentMonth: false,
            isInNextMonth: false,
            isToday: false
        }
        switch (true) {
            case startGap > 0:
                item.isInPrevMonth = true
                startGap--
                break;
            case count > 0:
                item.isInCurrentMonth = true
                item.isToday = todayString === dateString
                count--
                break;
            case endGap > 0:
                item.isInNextMonth = true
                endGap--
                break;
        }
        dateList.push(item)
        startDay = startDay.add(1, "day")
        dateString = startDay.format("DDMMYYYY")
    } while (startGap > 0 || count > 0 || endGap > 0)
    return dateList
}

function getWidth(start: Dayjs, end: Dayjs) {
    const toEnd = end.diff(start, "day", true)
    const toWeekend = start.endOf("week").startOf("day").diff(start, "day", true)
    return Math.min(toEnd, toWeekend)
}

function DayCeil({
    item,
    events
}: {
    item: dateItem
    events: EventList
}) {
    const eventRef = useRef<HTMLDivElement[]>([])
    const dayRef = useRef<HTMLDivElement>(null!)
    const [width, setWidth] = useState(0)
    const [mt, setMt] = useState("0px")

    function onEventClick(event: EventItem) {
        const type = DIALOG_NAMES.CONFIG_FORM
        const size = DIALOG_Sizes[type]
        window.ipcRenderer.send("openDialog",
            {
                type,
                ...size,
                info: event
            })
    }

    useEffect(() => {
        const resize = () => {
            setWidth(dayRef.current.clientWidth)
            let m = 0
            eventRef.current.forEach((i) => {
                m += i.clientHeight
            })
            setMt(m + "px")
        }
        resize()
        window.addEventListener("resize", resize)
        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [])

    const { longEvents, alldayEvents } = useMemo(() => {
        const date = item.date
        const currentDayTimestamp = date.valueOf()
        const currentDayEndTimestamp = date.endOf("day").valueOf()
        // 筛选事件
        const longEvents: (EventItem & { width: number })[] = []
        const alldayEvents: EventList = []
        events.forEach(i => {
            const eventStartTimestamp = i.date
            const eventEndTimestamp = i.endDate ?? eventStartTimestamp
            const showEvent = !((eventEndTimestamp < currentDayTimestamp) || (eventStartTimestamp > currentDayEndTimestamp))
            // today in event
            if (showEvent) {
                i.endDate ?
                    longEvents.push({
                        ...i,
                        // start in today
                        width: ((eventStartTimestamp <= currentDayEndTimestamp) &&
                            (eventStartTimestamp >= currentDayTimestamp) ||
                            //  today is monday
                            date.day() === 1) ?
                            // -> end of event || -> sunday
                            getWidth(date, dayjs(i.endDate)) :
                            0
                    }) :
                    alldayEvents.push(i)
            }
        })
        return { longEvents, alldayEvents }
    }, [item, events])

    const longEventsItems = useMemo(() => {
        const setEventRef = (el?: HTMLDivElement) => {
            if (el && eventRef.current.indexOf(el) === -1) {
                eventRef.current.push(el)
            }
        }
        eventRef.current = []
        return longEvents.map(i =>
            i.width > 0 ?
                <Card
                    key={i.id}
                    elevation={3}
                    ref={setEventRef}
                    sx={{
                        position: "absolute",
                        left: 0,
                        zIndex: 10
                    }}
                    style={{
                        right: -i.width * width + "px"
                    }}
                >
                    <CardActionArea onClick={() => onEventClick(i)} >
                        <CardContent sx={{ display: "flex", p: 1 }}>
                            <Typography >{i.title}</Typography >
                            <Typography >{i.description}</Typography >
                        </CardContent>
                    </CardActionArea>
                </Card > :
                <Box key={i.id} sx={{ opacity: 0, position: "absolute" }}>x</Box>
        )
    }, [width, longEvents])

    const alldayEventsItems = useMemo(() =>
        alldayEvents.map(i =>
            <Card
                elevation={3}
                key={i.id}
            >
                <CardActionArea onClick={() => onEventClick(i)} >
                    <CardContent sx={{ display: "flex", p: 1 }}>
                        <Typography >{i.title}</Typography >
                        <Typography >{i.description}</Typography >
                    </CardContent>
                </CardActionArea>
            </Card>
        ), [alldayEvents])

    return (
        <Day>
            <Box
                ref={dayRef}
                sx={{
                    display: "flex",
                    justifyContent: "end",
                    p: 1
                }}
            >
                <Box className={getDayColor(item)} >
                    {item.date.date()}
                </Box>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    right: 0
                }}
            >
                {longEventsItems}
            </Box>
            <Box sx={{ mt }} >
                {alldayEventsItems}
            </Box>
        </Day>
    )
}

function MonthGrid({
    date,
    events
}: {
    date: Dayjs
    events: EventList
}) {
    const title = useMemo(() => {
        return calendarData.week_name["zh"].map(i =>
            <Title key={i}>
                {i}
            </Title>
        )
    }, [])
    // getDate 1-31
    // getDay 0-6,0 is sunday
    // getMonth 0-11
    const content = useMemo(() => {
        const count = date.daysInMonth()
        const start = date.startOf("month")
        const end = date.endOf("month")
        const showStart = start.startOf("week")
        const showEnd = end.endOf("week")
        const startGap = start.diff(showStart, "day", true)
        const endGap = showEnd.diff(end, "day")

        // 筛选可显示的事件
        const showStartTimestamp = showStart.valueOf()
        const showEndTimestamp = showEnd.valueOf()
        const currentShowEvents = events.filter(i => {
            const eventStartTimestamp = i.date
            const eventEndTimestamp = i.endDate ?? eventStartTimestamp
            return !((eventEndTimestamp < showStartTimestamp) || (eventStartTimestamp > showEndTimestamp))
        })
        return buildDate({
            showStart,
            startGap,
            endGap,
            count
        }).map(i =>
            <DayCeil
                key={`${i.date.valueOf()}`}
                item={i}
                events={currentShowEvents}
            />
        )
    }, [date, events])
    return (
        <Box>
            <Week>
                {title}
            </Week>
            <Week>
                {content}
            </Week>
        </Box>
    )
}

export interface CalendarRef {
    jumpToDay: (value?: number) => void
}
export default forwardRef<CalendarRef, {
    countdownDate: EventList
}>(function Calendar({ countdownDate }, ref) {
    const [date, setDate] = useState(dayjs().startOf("day"))
    const [isMonthView, setIsMonthView] = useState(true)
    function prevDay() {
        setDate(date.subtract(1, "day"))
    }
    function nextDay() {
        setDate(date.add(1, "day"))
    }
    function prevMonth() {
        setDate(date.subtract(1, "month").startOf("month"))
    }
    function nextMonth() {
        setDate(date.add(1, "month").startOf("month"))
    }
    function prevYear() {
        setDate(date.subtract(1, "year").startOf("month"))
    }
    function nextYear() {
        setDate(date.add(1, "year").startOf("month"))
    }
    function today() {
        setDate(dayjs())
    }
    function jumpToDay(value?: number) {
        setDate(dayjs(value))
    }
    useImperativeHandle(ref, () => ({ jumpToDay }), [])
    return (
        <Box>
            <OptionBar
                date={date}
                isMonthView={isMonthView}
                setIsMonthView={setIsMonthView}
                prevDay={prevDay}
                nextDay={nextDay}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
                prevYear={prevYear}
                nextYear={nextYear}
                today={today}
            />
            <MonthGrid date={date} events={countdownDate} />
        </Box>
    )
}
)