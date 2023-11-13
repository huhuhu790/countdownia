import { createTheme, PaletteColor, PaletteColorOptions, PaletteOptions, Theme } from "@mui/material"
import { green, pink } from "@mui/material/colors"

declare module "@mui/material/styles" {
    interface Theme {
    }
    interface ThemeOptions {
    }
    interface Palette {
        green: PaletteColor
    }
    interface PaletteOptions {
        green?: PaletteColorOptions
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        green: true
    }
}

export const pageMaxWidth = 1400

const commonPaletteOptions: PaletteOptions = {
    primary: {
        main: green[200]
    },
    secondary: {
        main: pink[200]
    },
    contrastThreshold: 4.5,
}

function addOptions(theme: Theme) {
    return createTheme(theme, {
        palette: {
            green: theme.palette.augmentColor({
                color: {
                    main: green[300],
                },
                name: "green",
            }),
        }
    })
}

const light = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#F0F2F5"
        },
        ...commonPaletteOptions
    }
})

const dark = createTheme({
    palette: {
        mode: "dark",
        ...commonPaletteOptions
    }
})

export const themes = {
    light: addOptions(light),
    dark: addOptions(dark)
}