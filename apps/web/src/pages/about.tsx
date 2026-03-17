import { Fragment } from 'react'

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

export const AboutPage = () => (
    <Fragment>
        <Helmet>
            <title>About Pixel Guess | Free Image Guessing Game</title>
            <meta
                content="Learn about Pixel Guess, a free online image guessing game with 26+ categories including anime, games, movies, sports and more. Guess pixelated images in Easy or Hard mode!"
                name="description"
            />
        </Helmet>

        <div className="mx-auto max-w-2xl px-4 py-12">
            <h1 className="mb-6 text-3xl font-black text-foreground">
                About Pixel Guess
            </h1>

            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess is a free online image guessing game where players
                try to identify characters, logos, flags, and more from their
                pixelated versions. The game progressively reveals the image
                with each wrong guess, giving you up to 6 attempts to figure
                out what&apos;s hidden behind the pixels.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                How It Works
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Each round presents you with a heavily pixelated image. Your
                goal is to guess what the image shows before running out of
                attempts. With each wrong guess, the pixelation decreases and
                the image becomes clearer. On your 6th and final attempt, the
                image is fully revealed. The game tracks your streak — how
                many correct guesses you can make in a row.
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Game Modes
            </h2>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
                Pixel Guess offers two difficulty levels for every category:
            </p>
            <ul className="mb-6 list-inside list-disc space-y-2 text-[15px] leading-relaxed text-muted">
                <li>
                    <strong className="text-foreground">Easy Mode</strong> —
                    Color images with moderate pixelation. Great for casual
                    players and beginners.
                </li>
                <li>
                    <strong className="text-foreground">Hard Mode</strong> —
                    Grayscale images with extreme pixelation. A real challenge
                    even for experts.
                </li>
            </ul>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                26+ Categories
            </h2>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
                We have a wide variety of categories to choose from, spanning
                games, anime, movies, sports, and general knowledge:
            </p>
            <ul className="mb-6 list-inside list-disc space-y-2 text-[15px] leading-relaxed text-muted">
                <li>
                    <strong className="text-foreground">Movies & TV</strong> —
                    Guess popular movies, TV shows, and famous people by their
                    posters and photos.
                </li>
                <li>
                    <strong className="text-foreground">Anime</strong> — Dragon
                    Ball, Naruto, One Piece, Attack on Titan, Demon Slayer,
                    Jujutsu Kaisen, My Hero Academia, Death Note, Hunter x
                    Hunter, Fullmetal Alchemist, and a Top Anime Series poster
                    category.
                </li>
                <li>
                    <strong className="text-foreground">Games</strong> — League
                    of Legends, Valorant, Dota 2, Overwatch, Fortnite, and
                    Genshin Impact character guessing.
                </li>
                <li>
                    <strong className="text-foreground">
                        Sports & General
                    </strong>{' '}
                    — Football club crests, country flags, world brands,
                    Pok&eacute;mon, Harry Potter, and Rick &amp; Morty.
                </li>
            </ul>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Play Anywhere
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess is completely free and works on any device with a
                browser. No downloads, no sign-ups, no ads blocking your
                gameplay. We also have a native iOS app available on the{' '}
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

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Open Source
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Pixel Guess is open source and built with React, Vite,
                Tailwind CSS, and Expo for mobile. The entire codebase is
                available on{' '}
                <a
                    className="text-primary underline"
                    href="https://github.com/Jubstaaa/pixel-guess"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    GitHub
                </a>
                . Contributions and feedback are welcome!
            </p>

            <h2 className="mb-3 mt-8 text-xl font-bold text-foreground">
                Contact
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-muted">
                Have feedback, suggestions, or found a bug? Reach out at{' '}
                <a
                    className="text-primary underline"
                    href="mailto:ilkerbalcilartr@gmail.com"
                >
                    ilkerbalcilartr@gmail.com
                </a>{' '}
                or visit the{' '}
                <Link className="text-primary underline" to="/">
                    homepage
                </Link>{' '}
                to start playing.
            </p>
        </div>
    </Fragment>
)
