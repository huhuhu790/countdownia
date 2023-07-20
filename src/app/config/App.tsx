import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material"
import { SnackbarProvider } from "notistack"
import { ConfirmProvider } from "material-ui-confirm"
import { useMemo } from "react"
import { RouterProvider, } from "react-router-dom"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import router from "./router"

export default function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    const theme = useMemo(
        () => {
            const mode = prefersDarkMode ? "dark" : "light"
            return createTheme({
                palette: {
                    mode,
                }
            })
        },
        [prefersDarkMode],
    )
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                autoHideDuration={3000}
                SnackbarProps={{}}
            >
                <ConfirmProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <RouterProvider router={router} />
                    </LocalizationProvider>
                </ConfirmProvider>
            </SnackbarProvider>
        </ThemeProvider>
    )
}
