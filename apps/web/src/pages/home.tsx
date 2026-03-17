import { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

import { categories } from '@pixel-guess/shared'

import { CategoryCard } from '@/components/category-card/category-card'

export const HomePage = () => (
    <Fragment>
        <Helmet>
            <title>
                Pixel Guess: Guess Hidden Images by Pixel | Fun Image Guessing
                Game
            </title>
            <meta
                content="Join Pixel Guess and challenge yourself to guess hidden images, pixel by pixel. Choose from 26+ categories including anime, games, movies, sports and more. Free online image guessing game for all ages."
                name="description"
            />
        </Helmet>

        <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="mb-12 flex flex-col items-center text-center">
                <img
                    alt="Pixel Guess"
                    className="mb-4 h-20 w-20 rounded-[22px] shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]"
                    src="/android-chrome-192x192.png"
                />
                <h1 className="mb-2 text-[48px] font-[900] tracking-[-2px] text-foreground">
                    Pixel<span className="text-primary"> Guess</span>
                </h1>
                <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-[21px] text-muted">
                    The free image guessing game. Pick a category, guess the
                    hidden image pixel by pixel, and build your streak!
                </p>
            </div>

            <h2 className="mb-4 text-xl font-bold text-foreground">
                Choose a Category
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((item) => (
                    <CategoryCard key={item.slug} item={item} />
                ))}
            </div>

            <div className="mt-16 space-y-8 text-[15px] leading-relaxed text-muted">
                <div>
                    <h2 className="mb-3 text-xl font-bold text-foreground">
                        What is Pixel Guess?
                    </h2>
                    <p>
                        Pixel Guess is a free online game where you try to
                        identify characters, logos, flags, movie posters, and
                        more from their pixelated versions. Each round starts
                        with a heavily pixelated image that gradually becomes
                        clearer with each wrong guess. You have 6 attempts to
                        figure out what&apos;s hidden behind the pixels.
                    </p>
                </div>

                <div>
                    <h2 className="mb-3 text-xl font-bold text-foreground">
                        How to Play
                    </h2>
                    <p>
                        Choose any category above, pick Easy or Hard mode, and
                        start guessing! Type your answer in the search bar to
                        see matching suggestions. Easy mode shows full-color
                        images while Hard mode adds a grayscale filter for an
                        extra challenge. Track your streak and try to beat your
                        personal best!{' '}
                        <Link
                            className="text-primary underline"
                            to="/how-to-play"
                        >
                            Learn more about how to play
                        </Link>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="mb-3 text-xl font-bold text-foreground">
                        26+ Categories to Choose From
                    </h2>
                    <p>
                        From anime characters like Dragon Ball, Naruto, and One
                        Piece to game heroes from League of Legends, Valorant,
                        and Dota 2. Guess movie posters, TV show covers, famous
                        people, football club crests, country flags, world
                        brands, and much more. New categories are added
                        regularly!{' '}
                        <Link className="text-primary underline" to="/about">
                            Learn more about Pixel Guess
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    </Fragment>
)
