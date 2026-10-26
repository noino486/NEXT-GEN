import React from 'react';
import Chart from 'react-apexcharts';

const Chart03 = ({ 
  salesData, 
  revenueData, 
  categories 
}) => {
  const chartOptions = {
    series: [
      {
        name: "Sales",
        data: salesData || [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
      },
      {
        name: "Revenue",
        data: revenueData || [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
      },
    ],
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
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
      curve: "straight",
      width: ["2", "2"],
    },
    markers: {
      size: 0,
    },
    labels: {
      show: false,
      position: "top",
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
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: categories || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: false,
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div id="chartThree">
        <Chart options={chartOptions} series={chartOptions.series} type="area" height={310} />
      </div>
    </div>
  );
};

export default Chart03;

