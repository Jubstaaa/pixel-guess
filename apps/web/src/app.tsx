import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    ScrollRestoration,
} from 'react-router'

import { Footer } from './layout/footer'
import { GamePage } from './pages/game/game'
import { HomePage } from './pages/home/home'

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

// Home and the game are where visitors land, so they stay in the entry chunk:
// a lazy game route would add a request waterfall to every shared game link.
// The text pages load their own chunk on navigation.
const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: '/', element: <HomePage /> },
            {
                path: '/about',
                lazy: async () => ({
                    Component: (await import('./pages/about')).AboutPage,
                }),
            },
            {
                path: '/how-to-play',
                lazy: async () => ({
                    Component: (await import('./pages/how-to-play'))
                        .HowToPlayPage,
                }),
            },
            {
                path: '/privacy-policy',
                lazy: async () => ({
                    Component: (await import('./pages/privacy-policy'))
                        .PrivacyPolicyPage,
                }),
            },
            {
                path: '/terms-of-service',
                lazy: async () => ({
                    Component: (await import('./pages/terms-of-service'))
                        .TermsOfServicePage,
                }),
            },
            { path: '/:categorySlug/:difficulty', element: <GamePage /> },
            {
                path: '*',
                lazy: async () => ({
                    Component: (await import('./pages/not-found')).NotFoundPage,
                }),
            },
        ],
    },
])

export const App = () => <RouterProvider router={router} />
