import { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'

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
                content="Join Pixel Guess and challenge yourself to guess hidden images, pixel by pixel. Choose your favorite category and start guessing today. Fun and addictive image guessing game for all ages."
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
                <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-[21px] text-muted">
                    Pick a category and guess the hidden character pixel by
                    pixel.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((item) => (
                    <CategoryCard key={item.slug} item={item} />
                ))}
            </div>
        </div>
    </Fragment>
)
