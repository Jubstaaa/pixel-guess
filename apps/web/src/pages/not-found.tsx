import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

export const NotFoundPage = () => (
    <>
        <Helmet>
            <title>404 - Page Not Found | Pixel Guess</title>
        </Helmet>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
            <h1 className="text-[72px] font-[900] leading-none tracking-[-4px] text-primary">
                404
            </h1>
            <p className="mt-4 text-[18px] font-semibold text-foreground">
                Page not found
            </p>
            <p className="mt-2 text-[14px] text-muted">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                className="mt-8 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                to="/"
            >
                Back to Home
            </Link>
        </div>
    </>
)
