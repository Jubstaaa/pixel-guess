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

const router = createBrowserRouter([
    {
        children: [
            { element: <HomePage />, path: '/' },
            {
                lazy: async () => ({
                    Component: (await import('./pages/about')).AboutPage,
                }),
                path: '/about',
            },
            {
                lazy: async () => ({
                    Component: (await import('./pages/how-to-play'))
                        .HowToPlayPage,
                }),
                path: '/how-to-play',
            },
            {
                lazy: async () => ({
                    Component: (await import('./pages/privacy-policy'))
                        .PrivacyPolicyPage,
                }),
                path: '/privacy-policy',
            },
            {
                lazy: async () => ({
                    Component: (await import('./pages/terms-of-service'))
                        .TermsOfServicePage,
                }),
                path: '/terms-of-service',
            },
            {
                lazy: async () => ({
                    Component: (await import('./pages/game/game')).GamePage,
                }),
                path: '/:categorySlug/:difficulty',
            },
            {
                lazy: async () => ({
                    Component: (await import('./pages/not-found')).NotFoundPage,
                }),
                path: '*',
            },
        ],
        element: <Layout />,
    },
])

export const App = () => <RouterProvider router={router} />
