import React, { useCallback, useMemo, useRef, useState } from 'react'

import { SkipForward } from 'lucide-react-native'

import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'

import {
    charactersByCategory,
    checkGuess,
    filterCharacters,
    getNextState,
    getRandomCharacter,
    getSkipState,
} from '@pixel-guess/shared'
import type { Character, GameState } from '@pixel-guess/shared'

import { COLORS } from '@/constants/colors'
import { Image } from '@/lib/image'

import { PixelatedImage } from '../pixelated-image/pixelated-image'

import type { GameProps } from './game.types'

const CONFETTI_COLORS = [
    COLORS.primary,
    '#a855f7',
    '#f59e0b',
    '#10b981',
    '#f43f5e',
]

export const Game = ({ categorySlug, levelType }: GameProps) => {
    const confettiRef = useRef<ConfettiCannon>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

    const [input, setInput] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [guessedIndices, setGuessedIndices] = useState<number[]>([])
    const [isRevealed, setIsRevealed] = useState(false)

    const characters = useMemo(
        () => charactersByCategory[categorySlug] ?? [],
        [categorySlug]
    )

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

    const handleDismissDropdown = useCallback(() => {
        setShowDropdown(false)
        Keyboard.dismiss()
    }, [])

    const handleSelect = useCallback(
        (character: Character, index: number) => {
            if (!state.currentCharacter) return
            Keyboard.dismiss()
            setShowDropdown(false)
            setGuessedIndices((prev) => [...prev, index])

            const isCorrect = checkGuess(
                character.name,
                state.currentCharacter.name
            )
            const nextState = getNextState(state, isCorrect)

            if (isCorrect) {
                confettiRef.current?.start()
                setIsRevealed(true)
                setState(nextState)
                timeoutRef.current = setTimeout(() => {
                    setIsRevealed(false)
                    setGuessedIndices([])
                    setInput('')
                    pickNext(nextState)
                }, 2000)
            } else {
                if (nextState.count >= 6) {
                    setIsRevealed(true)
                    setState(nextState)
                    timeoutRef.current = setTimeout(() => {
                        setIsRevealed(false)
                        setGuessedIndices([])
                        setInput('')
                        pickNext(getSkipState(nextState))
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
            setInput('')
            pickNext(nextState)
        }, 2000)
    }, [state, pickNext])

    const filteredCharacters = useMemo(
        () => filterCharacters(characters, input, guessedIndices),
        [characters, input, guessedIndices]
    )

    const displayCount = isRevealed ? 6 : state.count

    if (!state.currentCharacter) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator color={COLORS.primary} />
            </View>
        )
    }

    return (
        <>
            {showDropdown && (
                <Pressable
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9,
                    }}
                    onPress={handleDismissDropdown}
                />
            )}

            <View className="pointer-events-none absolute inset-0 z-50">
                <ConfettiCannon
                    ref={confettiRef}
                    autoStart={false}
                    colors={CONFETTI_COLORS}
                    count={80}
                    fadeOut
                    origin={{ x: 0, y: 0 }}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-background"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View className="flex-1 items-center gap-4 px-4 pt-4">
                    <View className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
                        <PixelatedImage
                            key={state.currentCharacter.imageUrl}
                            count={displayCount}
                            imageUrl={state.currentCharacter.imageUrl}
                            levelType={levelType}
                            size={320}
                        />
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="absolute right-3 top-3 flex-row items-center gap-1.5 rounded-xl border border-border/50 bg-background/80 px-3 py-1.5"
                            disabled={isRevealed}
                            onPress={handleSkip}
                        >
                            <SkipForward color={COLORS.muted} size={14} />
                            <Text className="text-xs font-medium text-muted">
                                Skip
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="w-full" style={{ zIndex: 10 }}>
                        <TextInput
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="h-[56px] w-full rounded-2xl border border-border bg-surface px-5 text-[16px] text-foreground"
                            placeholder="Search character..."
                            placeholderTextColor={COLORS.muted}
                            value={input}
                            onChangeText={(v) => {
                                setInput(v)
                                setShowDropdown(true)
                            }}
                            onFocus={() => setShowDropdown(true)}
                        />

                        {showDropdown && filteredCharacters.length > 0 && (
                            <View
                                className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-2xl border border-border bg-surface"
                                style={{
                                    elevation: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: -4 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 12,
                                }}
                            >
                                {filteredCharacters.map(
                                    ({ character, index }, i) => (
                                        <React.Fragment key={index}>
                                            <TouchableOpacity
                                                className="flex-row items-center gap-3 px-4 py-3.5"
                                                onPress={() =>
                                                    handleSelect(
                                                        character,
                                                        index
                                                    )
                                                }
                                            >
                                                <Image
                                                    contentFit="cover"
                                                    source={{
                                                        uri: character.imageUrl,
                                                    }}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 8,
                                                    }}
                                                />
                                                <Text className="text-[15px] font-medium text-foreground">
                                                    {character.name}
                                                </Text>
                                            </TouchableOpacity>
                                            {i <
                                                filteredCharacters.length -
                                                    1 && (
                                                <View className="border-b border-border/50" />
                                            )}
                                        </React.Fragment>
                                    )
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    )
}
