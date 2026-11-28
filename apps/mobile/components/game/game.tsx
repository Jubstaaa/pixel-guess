import type { Character, GameState } from '@pixel-guess/shared'

import {
    advanceToNextCharacter,
    categories,
    charactersByCategory,
    checkGuess,
    COLORS,
    createInitialState,
    filterCharacters,
    getImageUrl,
    getNextState,
    getSkipState,
    MAX_COUNT,
} from '@pixel-guess/shared'
import { SkipForward } from 'lucide-react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

import { useInterstitialAd } from '@/hooks/use-interstitial-ad'
import { Image } from '@/lib/image'

import { PixelatedImage } from '../pixelated-image/pixelated-image'

interface GameProps {
    categorySlug: string
    levelType: number
}

const REVEAL_DURATION_MS = 2000

const CONFETTI_COLORS = [COLORS.primary, '#a855f7', '#10b981', '#f43f5e']

export const Game = ({ categorySlug, levelType }: GameProps) => {
    const confettiRef = useRef<ConfettiCannon>(null)

    const { onCorrectGuess } = useInterstitialAd()

    const [input, setInput] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [guessedIndices, setGuessedIndices] = useState<number[]>([])
    const [isRevealed, setIsRevealed] = useState(false)

    const category = useMemo(
        () => categories.find(c => c.slug === categorySlug),
        [categorySlug]
    )

    const characters = useMemo(
        () => charactersByCategory[categorySlug] ?? [],
        [categorySlug]
    )

    const [state, setState] = useState<GameState>(() =>
        createInitialState(characters)
    )

    useEffect(() => {
        if (!isRevealed) return

        const timeout = setTimeout(() => {
            setIsRevealed(false)
            setGuessedIndices([])
            setInput('')
            setState(current =>
                advanceToNextCharacter(characters, getSkipState(current))
            )
        }, REVEAL_DURATION_MS)

        return () => {
            clearTimeout(timeout)
        }
    }, [isRevealed, characters])

    const handleDismissDropdown = useCallback(() => {
        setShowDropdown(false)
        Keyboard.dismiss()
    }, [])

    const handleSelect = useCallback(
        (character: Character, index: number) => {
            if (!state.currentCharacter || isRevealed) return
            Keyboard.dismiss()
            setShowDropdown(false)
            setGuessedIndices(prev => [...prev, index])

            const isCorrect = checkGuess(
                character.name,
                state.currentCharacter.name
            )
            const nextState = getNextState(state, isCorrect)
            setState(nextState)

            if (isCorrect) {
                confettiRef.current?.start()
                onCorrectGuess()
            }
            if (isCorrect || nextState.count >= MAX_COUNT) {
                setIsRevealed(true)
            }
        },
        [state, isRevealed, onCorrectGuess]
    )

    const handleSkip = useCallback(() => {
        setIsRevealed(true)
    }, [])

    const filteredCharacters = useMemo(
        () => filterCharacters(characters, input, guessedIndices),
        [characters, input, guessedIndices]
    )

    const displayCount = isRevealed ? MAX_COUNT : state.count

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
                    onPress={handleDismissDropdown}
                    style={{
                        bottom: 0,
                        left: 0,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        zIndex: 9,
                    }}
                />
            )}

            <View className="pointer-events-none absolute inset-0 z-50">
                <ConfettiCannon
                    autoStart={false}
                    colors={CONFETTI_COLORS}
                    count={80}
                    fadeOut
                    origin={{ x: 0, y: 0 }}
                    ref={confettiRef}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-background"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
                <View className="flex-1 items-center gap-4 px-4 pt-4">
                    <View className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
                        <PixelatedImage
                            count={displayCount}
                            imageType={category?.imageType}
                            imageUrl={state.currentCharacter.imageUrl}
                            key={state.currentCharacter.imageUrl}
                            levelType={levelType}
                            size={320}
                        />
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="absolute right-3 top-3 flex-row items-center gap-1.5 rounded-xl border border-border/50 bg-background/80 px-3 py-1.5"
                            disabled={isRevealed}
                            onPress={handleSkip}>
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
                            editable={!isRevealed}
                            onChangeText={v => {
                                setInput(v)
                                setShowDropdown(true)
                            }}
                            onFocus={() => {
                                setShowDropdown(true)
                            }}
                            placeholder="Search character..."
                            placeholderTextColor={COLORS.muted}
                            value={input}
                        />

                        {showDropdown && filteredCharacters.length > 0 && (
                            <View
                                className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-2xl border border-border bg-surface"
                                style={{
                                    elevation: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { height: -4, width: 0 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 12,
                                }}>
                                {filteredCharacters.map(
                                    ({ character, index }, i) => (
                                        <React.Fragment key={index}>
                                            <TouchableOpacity
                                                className="flex-row items-center gap-3 px-4 py-3.5"
                                                onPress={() => {
                                                    handleSelect(
                                                        character,
                                                        index
                                                    )
                                                }}>
                                                <Image
                                                    contentFit="cover"
                                                    source={getImageUrl(
                                                        character.imageUrl
                                                    )}
                                                    style={{
                                                        borderRadius: 8,
                                                        height: 40,
                                                        width: 40,
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
