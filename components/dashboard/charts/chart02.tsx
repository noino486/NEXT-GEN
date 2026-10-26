"use client"

import dynamic from "next/dynamic"

// Import dynamique pour éviter les erreurs SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Chart02Props {
  value?: number
  label?: string
}

export default function Chart02({ value = 75.55, label = "Progression" }: Chart02Props) {
  const chartOptions = {
    series: [value],
    colors: ["#00E5FF"], // Couleur primaire KLYXY
    chart: {
      fontFamily: "Geist, sans-serif",
      type: "radialBar" as const,
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "80%",
        },
        track: {
          background: "var(--muted)",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: 60,
            color: "var(--foreground)",
            formatter: function (val: number) {
              return val + "%"
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#00E5FF"],
    },
    stroke: {
      lineCap: "round" as const,
    },
    labels: [label],
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 pt-5 sm:px-6 sm:pt-6">
      <div id="chartTwo">
        <Chart options={chartOptions} series={chartOptions.series} type="radialBar" height={330} />
      </div>
    </div>
  )
}

