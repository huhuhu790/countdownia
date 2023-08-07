import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material"
import { useMemo } from "react"
import Layout from "./layout"
import { getNode } from "./getNode"

const params = new URLSearchParams(location.search)
const Item = getNode(params.get("type"))

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
            <Layout>
                <Item />
            </Layout>
        </ThemeProvider>
    )
}
