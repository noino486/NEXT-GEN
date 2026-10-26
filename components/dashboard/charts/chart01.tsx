"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Import dynamique pour éviter les erreurs SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Chart01Props {
  data?: number[]
  categories?: string[]
  title?: string
}

export default function Chart01({ 
  data = [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112], 
  categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  title = "Ventes mensuelles"
}: Chart01Props) {
  const chartOptions = {
    series: [
      {
        name: "Ventes",
        data: data,
      },
    ],
    colors: ["#00E5FF"], // Couleur primaire KLYXY
    chart: {
      fontFamily: "Geist, sans-serif",
      type: "bar" as const,
      height: 180,
      width: "100%",
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 200 },
          plotOptions: { bar: { columnWidth: "60%" } },
          xaxis: { labels: { rotate: -45, style: { fontSize: "10px" } } },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end" as const,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
      },
    },
    legend: {
      show: true,
      position: "top" as const,
      horizontalAlign: "left" as const,
      fontFamily: "Geist",
      markers: {
        size: 8,
      },
      labels: {
        colors: "var(--foreground)",
      },
    },
    yaxis: {
      title: {
        text: "",
      },
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "var(--border)",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: "dark",
      x: {
        show: false,
      },
      y: {
        formatter: function (val: number) {
          return val.toString()
        },
      },
    },
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
      </div>
      <div className="w-full -ml-2">
        <Chart options={chartOptions} series={chartOptions.series} type="bar" height={180} width="100%" />
      </div>
    </div>
  )
}

