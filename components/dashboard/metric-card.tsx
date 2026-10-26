"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
  className?: string
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon,
  className 
}: MetricCardProps) {
  const changeColor = changeType === 'positive' 
    ? 'text-green-500' 
    : changeType === 'negative' 
    ? 'text-red-500' 
    : 'text-muted-foreground'

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border border-border bg-card px-5 py-6 sm:px-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <div className="text-primary">
                {icon}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-foreground">
              {value}
            </h3>
            {change && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className={cn("text-sm font-medium", changeColor)}>
                  {change}
                </span>
                <span className="text-sm text-muted-foreground">
                  vs mois dernier
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

