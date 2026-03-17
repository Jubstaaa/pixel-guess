import { BrowserRouter, Route, Routes } from 'react-router'

import { Footer } from './components/footer/footer'
import { AboutPage } from './pages/about'
import { GamePage } from './pages/game'
import { HomePage } from './pages/home'
import { HowToPlayPage } from './pages/how-to-play'
import { PrivacyPolicyPage } from './pages/privacy-policy'
import { TermsOfServicePage } from './pages/terms-of-service'

export const App = () => (
    <BrowserRouter>
        <div className="flex min-h-dvh flex-col">
            <main className="flex-1">
                <Routes>
                    <Route element={<HomePage />} path="/" />
                    <Route element={<AboutPage />} path="/about" />
                    <Route
                        element={<HowToPlayPage />}
                        path="/how-to-play"
                    />
                    <Route
                        element={<PrivacyPolicyPage />}
                        path="/privacy-policy"
                    />
                    <Route
                        element={<TermsOfServicePage />}
                        path="/terms-of-service"
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
