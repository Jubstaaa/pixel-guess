import { Fragment } from 'react'

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

export const PrivacyPolicyPage = () => (
    <Fragment>
        <Helmet>
            <title>Privacy Policy | Pixel Guess</title>
        </Helmet>

        <div className="mx-auto max-w-2xl px-4 py-12">
            <h1 className="mb-6 text-3xl font-black text-foreground">Privacy Policy</h1>

            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Welcome to Pixel Guess Game (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website{' '}
                <Link className="text-primary underline" to="/">
                    https://pixelguessgame.com
                </Link>{' '}
                (the &quot;Site&quot;).
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Information We Collect
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                We do not collect any personal information directly. However, third-party services
                used on our website (such as analytics or advertisements) may collect certain data.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">Cookies</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                We may use cookies to enhance user experience. You can disable cookies through your
                browser settings.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">Third-Party Services</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Our website may contain links to third-party websites. We are not responsible for
                their privacy policies and recommend reviewing them separately.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">Changes to This Policy</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                We may update this Privacy Policy periodically. Any changes will be posted on this
                page with an updated revision date.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">Contact Us</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a
                    className="text-primary underline"
                    href="mailto:ilkerbalcilartr@gmail.com"
                >
                    ilkerbalcilartr@gmail.com
                </a>
                .
            </p>
        </div>
    </Fragment>
)
