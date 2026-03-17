import { BrowserRouter, Route, Routes } from 'react-router'

import { Footer } from './components/footer/footer'
import { GamePage } from './pages/game'
import { HomePage } from './pages/home'
import { PrivacyPolicyPage } from './pages/privacy-policy'

export const App = () => (
    <BrowserRouter>
        <div className="flex min-h-dvh flex-col">
            <main className="flex-1">
                <Routes>
                    <Route element={<HomePage />} path="/" />
                    <Route
                        element={<PrivacyPolicyPage />}
                        path="/privacy-policy"
                    />
                    <Route
                        element={<GamePage />}
                        path="/:categorySlug/:difficulty"
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    </BrowserRouter>
)
