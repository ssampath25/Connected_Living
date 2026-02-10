"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

// Define the navigation order for swipe gestures
const SWIPE_PAGES = [
    "/dashboard",
    "/hub",
    "/ai",
    "/community",
    "/more"
]

interface SwipeConfig {
    threshold?: number // minimum distance for swipe
    allowedTime?: number // maximum time for swipe
}

export function useSwipeNavigation(config: SwipeConfig = {}) {
    const { threshold = 100, allowedTime = 300 } = config
    const router = useRouter()
    const pathname = usePathname()

    const touchStartX = useRef(0)
    const touchStartY = useRef(0)
    const touchStartTime = useRef(0)

    const getCurrentIndex = useCallback(() => {
        return SWIPE_PAGES.findIndex(page => pathname === page || pathname.startsWith(page + "/"))
    }, [pathname])

    const navigateToPage = useCallback((direction: "left" | "right") => {
        const currentIndex = getCurrentIndex()
        if (currentIndex === -1) return

        let newIndex: number
        if (direction === "left") {
            // Swipe left = go to next page
            newIndex = currentIndex + 1
        } else {
            // Swipe right = go to previous page
            newIndex = currentIndex - 1
        }

        // Check bounds
        if (newIndex >= 0 && newIndex < SWIPE_PAGES.length) {
            router.push(SWIPE_PAGES[newIndex])
        }
    }, [getCurrentIndex, router])

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX
            touchStartY.current = e.touches[0].clientY
            touchStartTime.current = Date.now()
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            const elapsedTime = Date.now() - touchStartTime.current

            const deltaX = touchEndX - touchStartX.current
            const deltaY = touchEndY - touchStartY.current

            // Check if it's a horizontal swipe (not vertical scroll)
            if (
                Math.abs(deltaX) > threshold &&
                Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && // More horizontal than vertical
                elapsedTime <= allowedTime
            ) {
                if (deltaX < 0) {
                    // Swipe left
                    navigateToPage("left")
                } else {
                    // Swipe right
                    navigateToPage("right")
                }
            }
        }

        // Add listeners
        document.addEventListener("touchstart", handleTouchStart, { passive: true })
        document.addEventListener("touchend", handleTouchEnd, { passive: true })

        return () => {
            document.removeEventListener("touchstart", handleTouchStart)
            document.removeEventListener("touchend", handleTouchEnd)
        }
    }, [threshold, allowedTime, navigateToPage])

    return {
        currentIndex: getCurrentIndex(),
        totalPages: SWIPE_PAGES.length,
        pages: SWIPE_PAGES
    }
}
