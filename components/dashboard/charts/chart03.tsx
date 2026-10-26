"use client"

import dynamic from "next/dynamic"

// Import dynamique pour éviter les erreurs SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Chart03Props {
  salesData?: number[]
  revenueData?: number[]
  categories?: string[]
}

export default function Chart03({ 
  salesData = [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235], 
  revenueData = [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}: Chart03Props) {
  const chartOptions = {
    series: [
      {
        name: "Ventes",
        data: salesData,
      },
      {
        name: "Revenus",
        data: revenueData,
      },
    ],
    legend: {
      show: false,
      position: "top" as const,
      horizontalAlign: "left" as const,
    },
    colors: ["#00E5FF", "#00B8CC"], // Couleurs primaires KLYXY avec variation
    chart: {
      fontFamily: "Geist, sans-serif",
      height: 310,
      type: "area" as const,
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        enabled: true,
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: "straight" as const,
      width: [2, 2],
    },
    markers: {
      size: 0,
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "var(--border)",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: "dark",
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category" as const,
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      labels: {
        style: {
          colors: "var(--muted-foreground)",
        },
      },
    },
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 pt-5 sm:px-6 sm:pt-6">
      <div id="chartThree">
        <Chart options={chartOptions} series={chartOptions.series} type="area" height={310} />
      </div>
    </div>
  )
}

