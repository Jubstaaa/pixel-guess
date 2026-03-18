import { Coffee, Mail } from 'lucide-react'
import { Link } from 'react-router'

export const Footer = () => (
    <footer className="mt-12 border-t border-border pb-8 pt-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <div className="flex flex-col items-center gap-1.5 sm:items-start">
                <div className="flex items-center gap-2">
                    <img
                        alt="Pixel Guess"
                        className="h-6 w-6 rounded-md"
                        src="/android-chrome-192x192.png"
                    />
                    <span className="text-[14px] font-semibold text-foreground">
                        PIXEL GUESS
                    </span>
                    <span className="text-border">|</span>
                    <span className="text-[13px] text-muted">
                        Made by{' '}
                        <a
                            className="text-foreground underline underline-offset-2"
                            href="https://ilkerbalcilar.com"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Jubstaa
                        </a>
                    </span>
                </div>
                <p className="text-[12px] text-muted">
                    &copy; {new Date().getFullYear()} Pixel Guess. All rights
                    reserved.
                </p>
                <div className="flex items-center gap-3">
                    <Link
                        className="text-[12px] text-muted opacity-70 transition-opacity hover:opacity-100"
                        to="/about"
                    >
                        About
                    </Link>
                    <Link
                        className="text-[12px] text-muted opacity-70 transition-opacity hover:opacity-100"
                        to="/how-to-play"
                    >
                        How to Play
                    </Link>
                    <Link
                        className="text-[12px] text-muted opacity-70 transition-opacity hover:opacity-100"
                        to="/privacy-policy"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        className="text-[12px] text-muted opacity-70 transition-opacity hover:opacity-100"
                        to="/terms-of-service"
                    >
                        Terms
                    </Link>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-end">
                <a
                    href="https://apps.apple.com/app/pixel-guess/id6760237625"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img
                        alt="Download on the App Store"
                        className="h-[36px]"
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    />
                </a>
                <div className="flex items-center gap-2">
                    <a
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted transition-colors hover:border-primary/50 hover:text-foreground"
                        href="mailto:ilkerbalcilartr@gmail.com"
                    >
                        <Mail className="h-4 w-4" />
                    </a>
                    <a
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted transition-colors hover:border-primary/50 hover:text-foreground"
                        href="https://buymeacoffee.com/jubstaa"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <Coffee className="h-4 w-4" />
                        <span>Buy me a coffee</span>
                    </a>
                </div>
            </div>
        </div>
    </footer>
)
