import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "./global.css"

const root = createRoot(document.getElementById("app"))
root.render(
    <StrictMode>
        <App />
    </StrictMode>
)