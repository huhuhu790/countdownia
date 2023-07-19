import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
    TextField
} from "@mui/material"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { EventInput } from "@fullcalendar/core"
import { DesktopDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

export interface FormDialogRef {
    openDialog: (isFormTypeAdd: boolean, currentEvent?: EventInput) => void
}

export default forwardRef<FormDialogRef>(function FormDialog(_, ref) {
    const [open, setOpen] = useState(false)
    const [formTypeAdd, setFormTypeAdd] = useState(true)
    const [startDate, setStartDate] = useState<Dayjs | null>(null)
    const [endDate, setEndDate] = useState<Dayjs | null>(null)
    const [line, setLine] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const id = useRef("")

    function handleClickOpen(isFormTypeAdd: boolean, currentEvent?: EventInput) {
        setFormTypeAdd(isFormTypeAdd)
        setOpen(true)
        const extendedProps: Partial<DateItem> = currentEvent?.extendedProps ?? {}
        id.current = extendedProps.id
        setTitle(extendedProps.title ?? "")
        setLine(extendedProps.line ?? "")
        setDescription(extendedProps.description ?? "")
        setStartDate(extendedProps.date ? dayjs(extendedProps.date) : null)
        setEndDate(extendedProps.endDate ? dayjs(extendedProps.endDate) : null)
    }

    useImperativeHandle(
        ref,
        () => ({
            openDialog: handleClickOpen
        }),
        []
    )

    function handleClose() {
        setOpen(false)
    }

    function onSubmit() {
        window.ipcRenderer.send("setCountdownDate", {
            id: id.current,
            date: startDate.valueOf(),
            title,
            line: line === "" ? undefined : line,
            endDate: endDate?.valueOf() ?? undefined,
            description: description === "" ? undefined : description
        })
        handleClose()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{formTypeAdd ? "Add" : "Edit"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To {formTypeAdd ? "add" : "edit"} an event, please enter your Title and date.
                </DialogContentText>
                <TextField
                    label="title"
                    type="text"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    label="line"
                    type="text"
                    fullWidth
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                />
                <DesktopDatePicker value={startDate} onChange={setStartDate} />
                <DesktopDatePicker value={endDate} onChange={setEndDate} />
                <TextField
                    label="description"
                    type="text"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={handleClose}>Cancel</Button>
                <Button color="primary" onClick={onSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
})