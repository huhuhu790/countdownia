import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material"
import { SnackbarProvider } from "notistack"
import { useMemo } from "react"
import { RouterProvider, } from "react-router-dom"
import { themes } from "@/themes/themeOptions"
import router from "./router"

export default function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    const theme = useMemo(
        () => {
            const mode = prefersDarkMode ? "dark" : "light"
            return themes[mode]
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
                <RouterProvider router={router} />
            </SnackbarProvider>
        </ThemeProvider>
    )
}
