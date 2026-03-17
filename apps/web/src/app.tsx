import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { GamePage } from './pages/game'
import { HomePage } from './pages/home'

export const App = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<GamePage />} path="/:categorySlug/:difficulty" />
        </Routes>
    </BrowserRouter>
)
