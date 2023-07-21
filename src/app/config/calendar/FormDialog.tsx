import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
    TextField,
    Box,
    Typography
} from "@mui/material"
import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { EventInput } from "@fullcalendar/core"
import { DesktopDateTimePicker } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs"
import { Controller, useForm } from "react-hook-form"

export interface FormDialogRef {
    openDialog: (isFormTypeAdd: boolean, currentEvent?: EventInput) => void
}
interface FormType {
    title: string
    line: string
    startDate: Dayjs | null
    endDate: Dayjs | null
    description: string
}
export default forwardRef<FormDialogRef>(function FormDialog(_, ref) {
    const [open, setOpen] = useState(false)
    const [formTypeAdd, setFormTypeAdd] = useState(true)
    const id = useRef("")
    const { control, handleSubmit, reset, setValue } = useForm<FormType, null, FormType>({
        defaultValues: {
            title: "",
            line: "",
            startDate: null,
            endDate: null,
            description: "",
        }
    })

    function handleClickOpen(isFormTypeAdd: boolean, currentEvent?: EventInput) {
        setFormTypeAdd(isFormTypeAdd)
        setOpen(true)
        const extendedProps: Partial<DateItem> = currentEvent?.extendedProps ?? {}
        id.current = extendedProps.id
        setValue("title", extendedProps.title ?? "")
        setValue("line", extendedProps.line ?? "")
        setValue("description", extendedProps.description ?? "")
        setValue("startDate", extendedProps.date ? dayjs(extendedProps.date) : null)
        setValue("endDate", extendedProps.endDate ? dayjs(extendedProps.endDate) : null)
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
        reset()
    }

    const onSubmit = handleSubmit(
        async (handler) => {
            window.ipcRenderer.send("setCountdownDate", {
                id: id.current,
                date: handler.startDate.valueOf(),
                title: handler.title,
                line: handler.line === "" ? undefined : handler.line,
                endDate: handler.endDate?.valueOf() ?? undefined,
                description: handler.description === "" ? undefined : handler.description
            })
            handleClose()
        }
    )

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{formTypeAdd ? "Add" : "Edit"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To {formTypeAdd ? "add" : "edit"} an event, please enter the following infomation.
                </DialogContentText>
                <Controller
                    name="title"
                    control={control}
                    rules={{ required: { value: true, message: "Title is required" } }}
                    render={({ field, fieldState }) =>
                        <TextField
                            sx={{ height: "80px" }}
                            label="title"
                            type="text"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            {...field}
                        />}
                />
                <Controller
                    name="line"
                    control={control}
                    rules={{ required: false }}
                    render={({ field, fieldState }) =>
                        <TextField
                            sx={{ height: "80px" }}
                            label="line"
                            type="text"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            {...field}
                        />
                    }
                />
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Controller
                        name="startDate"
                        control={control}
                        rules={{ required: { value: true, message: "Date is required" } }}
                        render={({ field, fieldState }) =>
                            <DesktopDateTimePicker
                                sx={{ height: "80px", flex: 1 }}
                                slotProps={{
                                    textField: {
                                        error: !!fieldState.error,
                                        helperText: fieldState.error?.message
                                    }
                                }}
                                {...field}
                            />
                        }
                    />
                    <Typography margin={3} mt={0} height="100%"> – </Typography>
                    <Controller
                        name="endDate"
                        control={control}
                        rules={{ required: false }}
                        render={({ field, fieldState }) =>
                            <DesktopDateTimePicker
                                sx={{ height: "80px", flex: 1 }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!fieldState.error,
                                        helperText: fieldState.error?.message
                                    }
                                }}
                                {...field}
                            />
                        }
                    />
                </Box>
                <Controller
                    name="description"
                    control={control}
                    rules={{ required: false }}
                    render={({ field, fieldState }) =>
                        <TextField
                            label="description"
                            type="text"
                            multiline
                            rows={4}
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            {...field}
                        />}
                />
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={handleClose}>Cancel</Button>
                <Button color="primary" onClick={onSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    )
})