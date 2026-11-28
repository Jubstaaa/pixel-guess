import { categories } from '@pixel-guess/shared'
import { Fragment } from 'react'
import { Link } from 'react-router'

import { adPlacements } from '../../ads/ad-placements'
import { AdSlot } from '../../ads/ad-slot'
import { useMediaQuery } from '../../ads/use-media-query'
import { CategoryCard } from './category-card'

export const AD_EVERY_N_CATEGORIES = 4

const hasAdAfter = (index: number) =>
    (index + 1) % AD_EVERY_N_CATEGORIES === 0 && index < categories.length - 1

const WIDE_LIST_QUERY = '(min-width: 640px)'

const ListAd = () => (
    <AdSlot
        className="col-span-full min-h-25.5 rounded-2xl border border-border bg-surface py-1.5"
        placement={
            useMediaQuery(WIDE_LIST_QUERY)
                ? adPlacements.homeListWide
                : adPlacements.homeListMobile
        }
    />
)

export const HomePage = () => (
    <Fragment>
        <title>
            Pixel Guess: Guess Hidden Images by Pixel | Fun Image Guessing Game
        </title>
        <meta
            content={`Join Pixel Guess and challenge yourself to guess hidden images, pixel by pixel. Choose from ${categories.length} categories including anime, games, movies, sports and more. Free online image guessing game for all ages.`}
            name="description"
        />

        <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="mb-12 flex flex-col items-center text-center">
                <img
                    alt=""
                    className="mb-4 h-20 w-20 rounded-[22px] shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]"
                    height={80}
                    src="/logo-240.webp"
                    width={80}
                />
                <h1 className="mb-2 text-[48px] font-[900] tracking-[-2px] text-foreground">
                    Pixel<span className="text-primary"> Guess</span>
                </h1>
                <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-[21px] text-muted">
                    The free image guessing game. Pick a category, guess the
                    hidden image pixel by pixel, in as few guesses as you can!
                </p>
                <a
                    className="mt-4"
                    href="https://apps.apple.com/app/pixel-guess/id6760237625"
                    rel="noopener noreferrer"
                    target="_blank">
                    <img
                        alt="Download on the App Store"
                        className="h-[40px] w-auto"
                        height={40}
                        src="/app-store-badge.svg"
                        width={120}
                    />
                </a>
            </div>

            <h2 className="mb-4 text-xl font-bold text-foreground">
                Choose a Category
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((item, index) => (
                    <Fragment key={item.slug}>
                        <CategoryCard item={item} />
                        {hasAdAfter(index) && <ListAd />}
                    </Fragment>
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
                        extra challenge.{' '}
                        <Link
                            className="text-primary underline"
                            to="/how-to-play">
                            Learn more about how to play
                        </Link>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="mb-3 text-xl font-bold text-foreground">
                        {categories.length} Categories to Choose From
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
