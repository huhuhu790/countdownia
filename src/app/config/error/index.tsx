import { Typography } from "@mui/material"
import { useRouteError } from "react-router-dom"

interface ErrorItem {
    statusText?: string
    message?: string
}

export default function ErrorPage() {
    const error: ErrorItem = useRouteError()

    return (
        <Typography> {error.statusText || error.message} </Typography>
    )
}