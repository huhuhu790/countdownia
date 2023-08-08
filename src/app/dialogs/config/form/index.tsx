import {
    Button, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
    TextField,
    Box,
    Typography
} from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { EventInput } from "@fullcalendar/core"
import { DesktopDateTimePicker } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs"
import { Controller, useForm } from "react-hook-form"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DIALOG_NAMES } from "../../../../utils/dialogNames"

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
export default function FormDialog() {
    const [formTypeAdd, setFormTypeAdd] = useState(true)
    const id = useRef("")
    const { control, handleSubmit, setValue } = useForm<FormType, null, FormType>({
        defaultValues: {
            title: "",
            line: "",
            startDate: null,
            endDate: null,
            description: "",
        }
    })

    useEffect(() => {
        function handleClickOpen(_: unknown, { info }: { info?: EventInput }) {
            setFormTypeAdd(!info)
            const extendedProps: Partial<DateItem> = info?.extendedProps ?? {}
            id.current = extendedProps.id
            setValue("title", extendedProps.title ?? "")
            setValue("line", extendedProps.line ?? "")
            setValue("description", extendedProps.description ?? "")
            setValue("startDate", extendedProps.date ? dayjs(extendedProps.date) : null)
            setValue("endDate", extendedProps.endDate ? dayjs(extendedProps.endDate) : null)
        }
        window.ipcRenderer.addListener("open-dialog-extraInfo", handleClickOpen)
        return () => {
            window.ipcRenderer.removeListener("open-dialog-extraInfo", handleClickOpen)
        }
    }, [])

    function handleClose() {
        window.ipcRenderer.send("hideDialog", DIALOG_NAMES.CONFIG_FORM)
    }

    const onSubmit = handleSubmit(
        (handler) => {
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
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DialogTitle>{formTypeAdd ? "Add Event" : "Edit Event"}</DialogTitle>
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
            </LocalizationProvider>
        </>
    )
}