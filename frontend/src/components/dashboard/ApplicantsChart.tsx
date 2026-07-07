"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
  data: {
    label: string;
    applications: number;
  }[];
};

export function ApplicantsChart({ data }: Props) {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.applications);
  const hasData = values.some((value) => value > 0);

  return (
    <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Candidaturas ao longo do tempo</h2>
          <p className="mt-1 text-[0.82rem] text-[#667085]">Últimos 7 dias com dados reais da empresa.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[0.78rem] font-medium text-[#64748b]">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Candidaturas
        </div>
      </div>

      <div className="mt-5 h-[260px]">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Candidaturas",
                data: values,
                borderColor: "#17a34a",
                backgroundColor: "rgba(23, 163, 74, 0.12)",
                pointBackgroundColor: "#17a34a",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.parsed.y} candidatura${context.parsed.y === 1 ? "" : "s"}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#94a3b8", font: { size: 11 } },
                border: { display: false },
              },
              y: {
                beginAtZero: true,
                grid: { color: "#edf1f6" },
                ticks: { color: "#94a3b8", font: { size: 11 }, stepSize: 1 },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {!hasData && (
        <p className="mt-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-[0.82rem] text-[#667085]">
          Ainda não houve candidaturas nos últimos 7 dias.
        </p>
      )}
    </div>
  );
}
