import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material"
import { useMemo } from "react"
import Layout from "./layout"
import { getNode } from "./getNode"
import { themes } from "@/themes/themeOptions"

const params = new URLSearchParams(location.search)
const Item = getNode(params.get("type"))

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
            <Layout>
                <Item />
            </Layout>
        </ThemeProvider>
    )
}
