import { Fragment } from 'react'

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

export const HowToPlayPage = () => (
    <Fragment>
        <Helmet>
            <title>How to Play Pixel Guess | Rules & Tips</title>
            <meta
                content="Learn how to play Pixel Guess, the free image guessing game. Understand the rules, scoring, difficulty modes, and get tips to improve your guessing skills."
                name="description"
            />
        </Helmet>

        <div className="mx-auto max-w-2xl px-4 py-12">
            <h1 className="mb-6 text-3xl font-black text-foreground">
                How to Play
            </h1>

            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess is simple to learn but hard to master. Here&apos;s
                everything you need to know to start playing.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Basic Rules
            </h2>
            <ol className="mb-6 list-inside list-decimal space-y-3 text-[15px] leading-relaxed text-muted">
                <li>
                    <strong className="text-foreground">
                        Choose a category
                    </strong>{' '}
                    — Pick from 26+ categories including anime characters, game
                    heroes, movie posters, football clubs, country flags, and
                    more.
                </li>
                <li>
                    <strong className="text-foreground">
                        Select a difficulty
                    </strong>{' '}
                    — Easy mode shows color images with moderate pixelation.
                    Hard mode uses grayscale with extreme pixelation.
                </li>
                <li>
                    <strong className="text-foreground">
                        Guess the image
                    </strong>{' '}
                    — A heavily pixelated image appears on screen. Type your
                    guess in the search bar and select from the suggestions.
                </li>
                <li>
                    <strong className="text-foreground">
                        6 attempts per round
                    </strong>{' '}
                    — Each wrong guess makes the image slightly clearer. After 6
                    attempts, the full image is revealed.
                </li>
                <li>
                    <strong className="text-foreground">
                        Build your streak
                    </strong>{' '}
                    — Correct guesses build your streak counter. How many can
                    you get in a row?
                </li>
            </ol>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Difficulty Modes Explained
            </h2>

            <div className="mb-6 space-y-4">
                <div className="rounded-xl border border-border bg-surface p-4">
                    <h3 className="mb-2 font-bold text-success">Easy Mode</h3>
                    <ul className="list-inside list-disc space-y-1 text-[15px] text-muted">
                        <li>Full color images</li>
                        <li>Moderate starting pixelation</li>
                        <li>
                            Larger pixel blocks that reveal more detail quickly
                        </li>
                        <li>
                            Recommended for beginners or unfamiliar categories
                        </li>
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4">
                    <h3 className="mb-2 font-bold text-warning">Hard Mode</h3>
                    <ul className="list-inside list-disc space-y-1 text-[15px] text-muted">
                        <li>Grayscale images (no color hints)</li>
                        <li>Extreme starting pixelation</li>
                        <li>
                            Smaller pixel blocks that keep the image
                            challenging longer
                        </li>
                        <li>For experts who know their category well</li>
                    </ul>
                </div>
            </div>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Tips & Strategies
            </h2>
            <ul className="mb-6 list-inside list-disc space-y-2 text-[15px] leading-relaxed text-muted">
                <li>
                    <strong className="text-foreground">
                        Look at colors first
                    </strong>{' '}
                    — In Easy mode, distinctive colors can give away the
                    character even when heavily pixelated. A blue and yellow
                    blur might be Wolverine!
                </li>
                <li>
                    <strong className="text-foreground">
                        Pay attention to shapes
                    </strong>{' '}
                    — Even at high pixelation, the overall silhouette and
                    proportions can help narrow down your guess.
                </li>
                <li>
                    <strong className="text-foreground">
                        Use the search wisely
                    </strong>{' '}
                    — The search bar filters characters as you type. If
                    you&apos;re not sure, type a partial name to browse the
                    options.
                </li>
                <li>
                    <strong className="text-foreground">
                        Skip strategically
                    </strong>{' '}
                    — If you&apos;re completely stuck, use the skip button to
                    move to the next image and keep your momentum going.
                </li>
                <li>
                    <strong className="text-foreground">
                        Start with Easy
                    </strong>{' '}
                    — If you&apos;re new to a category, play Easy mode first to
                    learn the characters before attempting Hard mode.
                </li>
                <li>
                    <strong className="text-foreground">
                        Recognize patterns
                    </strong>{' '}
                    — Football crests often have distinctive shapes. Flags have
                    unique color combinations. Anime characters have
                    recognizable hair colors.
                </li>
            </ul>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Scoring & Streaks
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess tracks your current streak and best streak for each
                category and difficulty separately. A correct guess on your
                first attempt is just as valuable as one on your sixth — what
                matters is getting it right! Your streaks are saved locally in
                your browser, so you can pick up where you left off.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Frequently Asked Questions
            </h2>

            <div className="mb-6 space-y-4">
                <div>
                    <h3 className="mb-1 font-bold text-foreground">
                        Is Pixel Guess free?
                    </h3>
                    <p className="text-[15px] text-muted">
                        Yes, completely free! No sign-up required, no in-app
                        purchases. Just open the website and start playing.
                    </p>
                </div>

                <div>
                    <h3 className="mb-1 font-bold text-foreground">
                        Does it work on mobile?
                    </h3>
                    <p className="text-[15px] text-muted">
                        Yes! The web version works on any device with a browser.
                        We also have a dedicated iOS app available on the{' '}
                        <a
                            className="text-primary underline"
                            href="https://apps.apple.com/app/id6760237625"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            App Store
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h3 className="mb-1 font-bold text-foreground">
                        How many characters are there?
                    </h3>
                    <p className="text-[15px] text-muted">
                        Over 1,800 unique items across 26+ categories, including
                        game characters, anime heroes, movie posters, football
                        club crests, country flags, brand logos, and more.
                    </p>
                </div>

                <div>
                    <h3 className="mb-1 font-bold text-foreground">
                        Can I suggest a new category?
                    </h3>
                    <p className="text-[15px] text-muted">
                        Absolutely! Reach out at{' '}
                        <a
                            className="text-primary underline"
                            href="mailto:ilkerbalcilartr@gmail.com"
                        >
                            ilkerbalcilartr@gmail.com
                        </a>{' '}
                        or open an issue on our{' '}
                        <a
                            className="text-primary underline"
                            href="https://github.com/Jubstaaa/pixel-guess"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            GitHub repository
                        </a>
                        .
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link
                    className="inline-block rounded-xl bg-primary px-8 py-3 font-bold text-white transition-opacity hover:opacity-90"
                    to="/"
                >
                    Start Playing Now
                </Link>
            </div>
        </div>
    </Fragment>
)
