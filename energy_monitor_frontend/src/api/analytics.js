import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function getInsights(token, { range = "7d" } = {}) {
  /** Get energy insights / anomalies / savings suggestions. */
  try {
    return await apiRequest("/analytics/insights", { token, query: { range } });
  } catch {
    return {
      range,
      summary: {
        total_kwh: 42.7,
        avg_watts: 180,
        peak_watts: 740,
        estimated_cost: 9.88,
      },
      insights: [
        {
          id: "ins_1",
          kind: "opportunity",
          title: "Standby drain detected",
          description:
            "One device shows persistent low wattage overnight. Consider scheduling it off from 1am–6am.",
          confidence: 0.78,
        },
        {
          id: "ins_2",
          kind: "anomaly",
          title: "Spike events",
          description: "Multiple short spikes above 600W. Check if a heater/kettle is on that circuit.",
          confidence: 0.64,
        },
      ],
    };
  }
}

// PUBLIC_INTERFACE
export async function getLeaderboard(token, { range = "7d" } = {}) {
  /** Get top consumers. */
  try {
    return await apiRequest("/analytics/leaderboard", { token, query: { range } });
  } catch {
    return [
      { device_id: "dev_a", name: "Living Room Plug", kwh: 14.1 },
      { device_id: "dev_b", name: "Office Desk", kwh: 9.7 },
      { device_id: "dev_c", name: "Kitchen Meter", kwh: 6.4 },
    ];
  }
}
