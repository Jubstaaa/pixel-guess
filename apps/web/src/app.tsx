import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { GamePage } from './pages/game'
import { HomePage } from './pages/home'
import { PrivacyPolicyPage } from './pages/privacy-policy'

export const App = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<PrivacyPolicyPage />} path="/privacy-policy" />
            <Route element={<GamePage />} path="/:categorySlug/:difficulty" />
        </Routes>
    </BrowserRouter>
)
