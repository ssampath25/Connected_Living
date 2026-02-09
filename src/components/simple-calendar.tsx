"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AttendanceItem } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SimpleCalendarProps {
    attendance: AttendanceItem[]
    className?: string
}

export function SimpleCalendar({ attendance, className }: SimpleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0])

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    // Calculate Summary Stats for current month
    let presentCount = 0
    let absentCount = 0

    const days = []
    // Padding for empty days
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />)
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const record = attendance.find(a => a.isoDate === dateStr)
        const isSelected = selectedDate === dateStr

        let statusColor = ""
        if (record) {
            if (record.status === "Present" || record.status === "Half-day") {
                statusColor = "bg-green-500/10 text-green-600 font-bold border-green-500/20"
                presentCount++
            } else if (record.status === "Absent") {
                statusColor = "bg-destructive/10 text-destructive font-bold border-destructive/20"
                absentCount++
            }
        }

        days.push(
            <div
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all border cursor-pointer relative",
                    statusColor,
                    !statusColor && "text-foreground/70 hover:bg-accent border-transparent",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                )}
            >
                {day}
            </div>
        )
    }

    const selectedRecord = attendance.find(a => a.isoDate === selectedDate)

    return (
        <div className={cn("bg-card p-4 rounded-2xl shadow-sm border border-border transition-colors", className)}>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-accent rounded-full transition-colors">
                    <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
                <div className="font-bold text-foreground">{monthName} {year}</div>
                <button onClick={nextMonth} className="p-1 hover:bg-accent rounded-full transition-colors">
                    <ChevronRight size={20} className="text-muted-foreground" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-xs font-bold text-muted-foreground uppercase w-10">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 place-items-center mb-6">
                {days}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
                <div className="mb-6 p-4 bg-accent/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    {selectedRecord ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    selectedRecord.status === 'Absent' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
                                )}>
                                    {selectedRecord.status}
                                </span>
                            </div>
                            <div className="text-right text-xs font-bold text-foreground">
                                <div>In: {selectedRecord.checkIn}</div>
                                {selectedRecord.checkOut && <div>Out: {selectedRecord.checkOut}</div>}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm font-medium text-muted-foreground italic text-center py-2">No attendance record</p>
                    )}
                </div>
            )}

            {/* Monthly Stats */}
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="text-center p-2 rounded-xl bg-green-500/5">
                    <div className="text-xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-[10px] uppercase font-bold text-green-600/80 tracking-wider">Days Present</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-destructive/5">
                    <div className="text-xl font-bold text-destructive">{absentCount}</div>
                    <div className="text-[10px] uppercase font-bold text-destructive/80 tracking-wider">Days Absent</div>
                </div>
            </div>
        </div>
    )
}
