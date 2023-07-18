import { createMemoryRouter } from "react-router-dom"
import ConfigLayout from '../layout'
import CalendarPage from '../calendar'
import WelcomePage from '../welcome'
import ErrorPage from '../error'

export default createMemoryRouter(
    [
        {
            path: "/",
            element: <ConfigLayout />,
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <WelcomePage />,
                },
                {
                    path: "calendar",
                    element: <CalendarPage />,
                },
            ],
        },
    ],
);
