import { Fragment } from 'react'

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

export const TermsOfServicePage = () => (
    <Fragment>
        <Helmet>
            <title>Terms of Service | Pixel Guess</title>
        </Helmet>

        <div className="mx-auto max-w-2xl px-4 py-12">
            <h1 className="mb-6 text-3xl font-black text-foreground">
                Terms of Service
            </h1>

            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Welcome to Pixel Guess (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). By accessing or using our website at{' '}
                <Link className="text-primary underline" to="/">
                    https://pixelguessgame.com
                </Link>{' '}
                (the &quot;Service&quot;), you agree to be bound by these Terms
                of Service.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Use of Service
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess is a free online game provided for entertainment
                purposes. You may use the Service for personal,
                non-commercial use. You agree not to misuse the Service,
                including but not limited to attempting to access unauthorized
                areas, interfering with other users, or using automated tools
                to scrape content.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Intellectual Property
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                The Pixel Guess name, logo, and original game code are the
                property of Pixel Guess. Character images, logos, and other
                media displayed in the game belong to their respective
                copyright holders and are used for educational and
                entertainment purposes under fair use. All trademarks,
                service marks, and trade names are the property of their
                respective owners.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                User Data
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess stores game progress (streaks and scores) locally
                in your browser using localStorage. We do not collect personal
                information or require account creation. For more details,
                please see our{' '}
                <Link className="text-primary underline" to="/privacy-policy">
                    Privacy Policy
                </Link>
                .
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Disclaimer
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                The Service is provided &quot;as is&quot; without warranties of
                any kind, either express or implied. We do not guarantee that
                the Service will be available at all times or free of errors.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Limitation of Liability
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                In no event shall Pixel Guess be liable for any indirect,
                incidental, special, or consequential damages arising out of
                or in connection with the use of the Service.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Changes to Terms
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                We reserve the right to update these Terms at any time.
                Continued use of the Service after changes constitutes
                acceptance of the new Terms.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Contact
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                If you have any questions about these Terms, contact us at{' '}
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
