import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    ScrollRestoration,
} from 'react-router'

import { Footer } from './components/footer/footer'
import { AboutPage } from './pages/about'
import { GamePage } from './pages/game'
import { HomePage } from './pages/home'
import { HowToPlayPage } from './pages/how-to-play'
import { NotFoundPage } from './pages/not-found'
import { PrivacyPolicyPage } from './pages/privacy-policy'
import { TermsOfServicePage } from './pages/terms-of-service'

const Layout = () => (
    <>
        <ScrollRestoration />
        <div className="flex min-h-dvh flex-col">
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    </>
)

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/about', element: <AboutPage /> },
            { path: '/how-to-play', element: <HowToPlayPage /> },
            { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
            { path: '/terms-of-service', element: <TermsOfServicePage /> },
            { path: '/:categorySlug/:difficulty', element: <GamePage /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
])

export const App = () => <RouterProvider router={router} />
