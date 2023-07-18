import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import Home from './Home'
import "./global.css"

const root = createRoot(document.getElementById('app'));
root.render(
    <StrictMode>
        <Home />
    </StrictMode>
);