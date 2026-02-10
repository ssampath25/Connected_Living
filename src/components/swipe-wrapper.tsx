"use client"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"

interface SwipeWrapperProps {
    children: React.ReactNode
}

export function SwipeWrapper({ children }: SwipeWrapperProps) {
    // Initialize swipe navigation - this attaches touch listeners to document
    useSwipeNavigation({
        threshold: 80, // minimum swipe distance in pixels
        allowedTime: 400 // maximum time for swipe gesture in ms
    })

    return <>{children}</>
}
