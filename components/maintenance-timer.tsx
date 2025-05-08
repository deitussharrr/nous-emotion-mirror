"use client"

import { useEffect, useState } from "react"

interface MaintenanceTimerProps {
  endTime: number
}

export default function MaintenanceTimer({ endTime }: MaintenanceTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = endTime - now

      if (difference <= 0) {
        // Maintenance period is over
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, "0")}</span>
        <span className="text-xs text-muted-foreground">Hours</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</span>
        <span className="text-xs text-muted-foreground">Minutes</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</span>
        <span className="text-xs text-muted-foreground">Seconds</span>
      </div>
    </div>
  )
}
