import { createMemoryRouter } from "react-router-dom"
import ConfigLayout from "../layout"
import CalendarPage from "../calendar"
import ErrorPage from "../error"
import OptionsPage from "../options"

export default createMemoryRouter(
    [
        {
            path: "/",
            element: <ConfigLayout />,
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <CalendarPage />,
                },
                {
                    path: "/options",
                    element: <OptionsPage />,
                },
            ],
        },
    ],
    { initialEntries: ["/options"] }
)
