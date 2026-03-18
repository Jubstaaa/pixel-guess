import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { ChevronLeft, SkipForward } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router'

import {
    categories,
    charactersByCategory,
    checkGuess,
    getNextState,
    getRandomCharacter,
    getSkipState,
    MAX_COUNT,
} from '@pixel-guess/shared'
import type { Character, Difficulty, GameState } from '@pixel-guess/shared'

import { CharacterSearch } from '@/components/character-search/character-search'
import { PixelatedCanvas } from '@/components/pixelated-canvas/pixelated-canvas'
import { triggerConfetti } from '@/lib/confetti'

import type { GameContentProps } from './game.types'

export const GamePage = () => {
    const { categorySlug, difficulty } = useParams<{
        categorySlug: string
        difficulty: string
    }>()

    const category = categories.find((c) => c.slug === categorySlug)
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
            difficulty={difficulty as Difficulty}
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

    const [state, setState] = useState<GameState>(() => {
        const pick = getRandomCharacter(characters, [])
        return {
            currentCharacter: pick?.character ?? null,
            count: 0,
            seenIndices: pick ? [pick.index] : [],
        }
    })

    const pickNext = useCallback(
        (newState: GameState) => {
            const pick = getRandomCharacter(characters, newState.seenIndices)
            const seenIndices =
                pick === null ? [] : [...newState.seenIndices, pick.index]
            const nextPick = pick ?? getRandomCharacter(characters, [])

            setState({
                ...newState,
                currentCharacter: nextPick?.character ?? null,
                seenIndices:
                    pick === null && nextPick ? [nextPick.index] : seenIndices,
            })
        },
        [characters]
    )

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    const handleSelect = useCallback(
        (_character: Character, index: number) => {
            if (!state.currentCharacter) return
            setGuessedIndices((prev) => [...prev, index])

            const isCorrect = checkGuess(
                _character.name,
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
        [state, pickNext]
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

    return (
        <Fragment>
            <Helmet>
                <title>
                    Pixel Guess: {category.name} Category |{' '}
                    {difficulty === 'easy' ? 'Easy' : 'Hard'} Mode
                </title>
                <meta
                    content={`${category.name} Category: Test your skills in guessing hidden images pixel by pixel in the ${category.name} category. Choose your challenge and start guessing!`}
                    name="description"
                />
                <meta
                    content={`Pixel Guess: ${category.name} Category | Fun Image Guessing Game`}
                    property="og:title"
                />
                <meta
                    content={`${category.name} Category: Test your skills in guessing hidden images pixel by pixel in the ${category.name} category.`}
                    property="og:description"
                />
                <meta
                    content={`https://pixelguessgame.com/${category.slug}/${difficulty}`}
                    property="og:url"
                />
                <meta content={category.icon} property="og:image" />
                <meta
                    content={`Pixel Guess: ${category.name} Category | Fun Image Guessing Game`}
                    name="twitter:title"
                />
                <meta
                    content={`${category.name} Category: Guess hidden images in the ${category.name} category. Challenge yourself!`}
                    name="twitter:description"
                />
                <meta content={category.icon} name="twitter:image" />
            </Helmet>

            <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pt-4 pb-8">
                <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3">
                    <Link
                        className="rounded-xl border border-border bg-surface-hover p-2 transition-opacity hover:opacity-80"
                        to="/"
                    >
                        <ChevronLeft className="h-[18px] w-[18px] text-foreground" />
                    </Link>
                    <img
                        alt={category.name}
                        className="h-[22px] w-[22px] rounded-lg object-contain"
                        src={category.icon}
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
                        type="button"
                        onClick={handleSkip}
                    >
                        <SkipForward className="h-3.5 w-3.5" />
                        Skip
                    </button>
                </div>

                <div className="w-full">
                    <CharacterSearch
                        characters={characters}
                        excludeIndices={guessedIndices}
                        onSelect={handleSelect}
                    />
                </div>
            </div>
        </Fragment>
    )
}
