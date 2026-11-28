import type {
    Category,
    Character,
    Difficulty,
    GameState,
} from '@pixel-guess/shared'

import {
    advanceToNextCharacter,
    categories,
    charactersByCategory,
    checkGuess,
    createInitialState,
    getImageUrl,
    getNextState,
    getSkipState,
    MAX_COUNT,
} from '@pixel-guess/shared'
import { ChevronLeft, SkipForward } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'

import { adPlacements } from '../../ads/ad-placements'
import { AdSlot } from '../../ads/ad-slot'
import { useMediaQuery } from '../../ads/use-media-query'
import { CharacterSearch } from './character-search'
import { triggerConfetti } from './confetti'
import { PixelatedCanvas } from './pixelated-canvas'

const SIDEBAR_ADS_QUERY = '(min-width: 1280px)'

interface GameContentProps {
    category: Category
    characters: Character[]
    difficulty: Difficulty
}

export const GamePage = () => {
    const { categorySlug, difficulty } = useParams<{
        categorySlug: string
        difficulty: string
    }>()

    const category = categories.find(c => c.slug === categorySlug)
    const characters = categorySlug
        ? charactersByCategory[categorySlug]
        : undefined

    if (
        !category ||
        !characters ||
        (difficulty !== 'easy' && difficulty !== 'hard')
    ) {
        return <Navigate replace to="/" />
    }

    return (
        <GameContent
            category={category}
            characters={characters}
            difficulty={difficulty}
        />
    )
}

const GameContent = ({
    category,
    characters,
    difficulty,
}: GameContentProps) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [guessedIndices, setGuessedIndices] = useState<number[]>([])

    const [state, setState] = useState<GameState>(() =>
        createInitialState(characters)
    )

    const pickNext = useCallback(
        (newState: GameState) => {
            setState(advanceToNextCharacter(characters, newState))
        },
        [characters]
    )

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const handleSelect = useCallback(
        (character: Character, index: number) => {
            if (!state.currentCharacter || isRevealed) return
            setGuessedIndices(prev => [...prev, index])

            const isCorrect = checkGuess(
                character.name,
                state.currentCharacter.name
            )
            const nextState = getNextState(state, isCorrect)

            if (isCorrect) {
                triggerConfetti()
                setIsRevealed(true)
                setState(nextState)
                timeoutRef.current = setTimeout(() => {
                    setIsRevealed(false)
                    setGuessedIndices([])
                    pickNext(nextState)
                }, 2000)
            } else {
                if (nextState.count >= MAX_COUNT) {
                    setIsRevealed(true)
                    setState(nextState)
                    timeoutRef.current = setTimeout(() => {
                        setIsRevealed(false)
                        setGuessedIndices([])
                        const skipped = getSkipState(nextState)
                        pickNext(skipped)
                    }, 2000)
                } else {
                    setState(nextState)
                }
            }
        },
        [state, isRevealed, pickNext]
    )

    const handleSkip = useCallback(() => {
        setIsRevealed(true)
        const nextState = getSkipState(state)
        setState(nextState)
        timeoutRef.current = setTimeout(() => {
            setIsRevealed(false)
            setGuessedIndices([])
            pickNext(nextState)
        }, 2000)
    }, [state, pickNext])

    const displayCount = isRevealed ? MAX_COUNT : state.count
    const hasSidebarAds = useMediaQuery(SIDEBAR_ADS_QUERY)

    return (
        <Fragment>
            <title>{`Pixel Guess: ${category.name} Category | ${difficulty === 'easy' ? 'Easy' : 'Hard'} Mode`}</title>
            <meta
                content={`${category.name} Category: Test your skills in guessing hidden images pixel by pixel in the ${category.name} category. Choose your challenge and start guessing!`}
                name="description"
            />

            {}
            <div className={hasSidebarAds ? 'relative min-h-168' : undefined}>
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pt-4 pb-8">
                    <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3">
                        <Link
                            aria-label="Back to categories"
                            className="rounded-xl border border-border bg-surface-hover p-2 transition-opacity hover:opacity-80"
                            to="/">
                            <ChevronLeft
                                aria-hidden="true"
                                className="h-[18px] w-[18px] text-foreground"
                            />
                        </Link>
                        <img
                            alt=""
                            className="h-[22px] w-[22px] rounded-lg object-contain"
                            height={22}
                            src={getImageUrl(category.icon)}
                            width={22}
                        />
                        <span className="flex-1 truncate text-[14px] font-semibold text-foreground">
                            {category.name}
                        </span>
                    </div>

                    <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border shadow-lg">
                        <PixelatedCanvas
                            count={displayCount}
                            difficulty={difficulty}
                            imageType={category.imageType}
                            imageUrl={state.currentCharacter?.imageUrl ?? null}
                        />
                        <button
                            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-xl border border-border/50 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-sm transition-opacity hover:opacity-80 disabled:opacity-50"
                            disabled={isRevealed}
                            onClick={handleSkip}
                            type="button">
                            <SkipForward
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                            />
                            Skip
                        </button>
                    </div>

                    <div className="w-full">
                        <CharacterSearch
                            characters={characters}
                            disabled={isRevealed}
                            excludeIndices={guessedIndices}
                            onSelect={handleSelect}
                        />
                    </div>

                    {!hasSidebarAds && (
                        <AdSlot
                            className="mt-8"
                            placement={adPlacements.gameMobile}
                        />
                    )}
                </div>
                {hasSidebarAds && (
                    <Fragment>
                        <AdSlot
                            className="absolute top-4 left-[calc(25%-12rem)]"
                            placement={adPlacements.gameSidebar}
                        />
                        <AdSlot
                            className="absolute top-4 right-[calc(25%-12rem)]"
                            placement={adPlacements.gameSidebar}
                        />
                    </Fragment>
                )}
            </div>
        </Fragment>
    )
}
