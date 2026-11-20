import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    ScrollRestoration,
} from 'react-router'

import { Footer } from './layout/footer'
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

// Only home is in the entry chunk. The game carries every character list
// (most of the bundle), so keeping it out lets home paint much sooner; a
// shared game link pays one extra request for it, started as soon as the
// router matches the URL.
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
            {
                path: '/:categorySlug/:difficulty',
                lazy: async () => ({
                    Component: (await import('./pages/game/game')).GamePage,
                }),
            },
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
