// components/admin/BusinessTab.js
import { useState, useEffect } from "react";
import { supabase } from "shared/lib/supabase";

const G = {
  bg: "#09090C",
  bg2: "#0F0F14",
  bg3: "#16161E",
  bg4: "#1C1C26",
  gold: "#C9A84C",
  goldL: "#E8C97A",
  border: "rgba(255,255,255,0.06)",
  borderG: "rgba(201,168,76,0.20)",
  t1: "#F2F2F7",
  t2: "#AEAEB2",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
  blue: "#0A84FF",
};

export default function BusinessTab({ notify }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("b2b_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
    setLoading(false);
  }

  const stages = ["lead", "contacted", "demo", "negotiating", "won", "lost"];

  const stageColors = {
    lead: G.t3,
    contacted: G.blue,
    demo: G.orange,
    negotiating: G.gold,
    won: G.green,
    lost: G.red,
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
          B2B Pipeline
        </h2>
        <p style={{ fontSize: 14, color: G.t2 }}>
          Track enterprise leads and custom intelligence projects
        </p>
      </div>

      {/* Pipeline Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const totalValue = stageLeads.reduce(
            (sum, l) => sum + (l.estimated_value || 0),
            0,
          );

          return (
            <div
              key={stage}
              className="premium-card"
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${stageColors[stage]}40`,
                background: G.bg2,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: G.t3,
                  marginBottom: 6,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {stage}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: stageColors[stage],
                  marginBottom: 4,
                }}
              >
                {stageLeads.length}
              </div>
              {totalValue > 0 && (
                <div style={{ fontSize: 11, color: G.t3 }}>
                  ${(totalValue / 100).toLocaleString()}/mo
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
          Loading pipeline...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);

            return (
              <div
                key={stage}
                className="premium-card"
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${G.border}`,
                  background: G.bg2,
                  minHeight: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: stageColors[stage],
                    textTransform: "uppercase",
                    marginBottom: 12,
                    letterSpacing: "0.05em",
                  }}
                >
                  {stage} ({stageLeads.length})
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${G.border}`,
                        background: G.bg3,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        notify?.(
                          "info",
                          `${lead.company_name} · ${lead.plan_interest} · $${((lead.estimated_value || 0) / 100).toLocaleString()}/mo`,
                        );
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {lead.company_name}
                      </div>
                      {lead.contact_name && (
                        <div
                          style={{ fontSize: 11, color: G.t3, marginBottom: 6 }}
                        >
                          {lead.contact_name}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: G.t2 }}>
                        {lead.plan_interest}
                      </div>
                      {lead.estimated_value && (
                        <div
                          style={{
                            fontSize: 12,
                            color: G.gold,
                            marginTop: 6,
                            fontWeight: 700,
                          }}
                        >
                          ${(lead.estimated_value / 100).toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: G.t3,
                        fontSize: 12,
                      }}
                    >
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Lead Button */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button
          onClick={() => notify?.("info", "Lead creation modal coming soon")}
          className="premium-btn"
          style={{ padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800 }}
        >
          + Add New Lead
        </button>
      </div>
    </div>
  );
}
