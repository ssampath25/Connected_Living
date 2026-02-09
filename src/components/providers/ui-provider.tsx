"use client"

import React, { createContext, useContext, useState } from "react"

interface UIContextType {
    isInteractivityDisabled: boolean
    setInteractivityDisabled: (disabled: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isInteractivityDisabled, setInteractivityDisabled] = useState(false)

    return (
        <UIContext.Provider value={{ isInteractivityDisabled, setInteractivityDisabled }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const context = useContext(UIContext)
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider")
    }
    return context
}
