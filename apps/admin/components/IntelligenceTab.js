// components/admin/IntelligenceTab.js
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

const Icon = {
  check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

function AnomalyCard({ anomaly, onReview }) {
  const [reviewing, setReviewing] = useState(false);

  async function handleReview(isLegitimate) {
    setReviewing(true);
    await onReview(anomaly.id, isLegitimate);
    setReviewing(false);
  }

  const severityColor =
    {
      low: G.blue,
      medium: G.orange,
      high: G.red,
      critical: G.red,
    }[anomaly.severity] || G.orange;

  return (
    <div className="premium-card"
      style={{
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${severityColor}40`,
        background: G.bg2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                background: severityColor + "15",
                color: severityColor,
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              {anomaly.severity}
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                background: G.bg3,
                color: G.t2,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {anomaly.anomaly_type}
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            {anomaly.items?.name || "Unknown Item"}
          </div>

          <div style={{ fontSize: 13, color: G.t2, marginBottom: 8 }}>
            {anomaly.metric_name} changed by{" "}
            <span
              style={{
                color: anomaly.change_percentage > 0 ? G.green : G.red,
                fontWeight: 700,
              }}
            >
              {anomaly.change_percentage > 0 ? "+" : ""}
              {anomaly.change_percentage.toFixed(0)}%
            </span>
          </div>

          {anomaly.explanation && (
            <div style={{ fontSize: 12, color: G.t3, marginBottom: 12 }}>
              {anomaly.explanation}
            </div>
          )}

          <div style={{ fontSize: 11, color: G.t3 }}>
            Detected {new Date(anomaly.detected_at).toLocaleString()}
          </div>
        </div>

        {!reviewing && (
          <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
            <button
              onClick={() => handleReview(true)}
              className="premium-btn"
              style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Icon.check /> Legitimate
            </button>
            <button
              onClick={() => handleReview(false)}
              className="premium-btn"
              style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 4, background: G.red+"15" }}
            >
              <Icon.x /> Bot/Spam
            </button>
          </div>
        )}

        {reviewing && (
          <div style={{ color: G.t3, fontSize: 12 }}>Processing...</div>
        )}
      </div>
    </div>
  );
}

function PendingItemCard({ item, onApprove, onReject }) {
  const [processing, setProcessing] = useState(false);

  async function handleApprove() {
    setProcessing(true);
    await onApprove(item.id, item.item_data);
    setProcessing(false);
  }

  async function handleReject() {
    setProcessing(true);
    await onReject(item.id);
    setProcessing(false);
  }

  const data = item.item_data || {};

  return (
    <div className="premium-card" style={{ padding: 16, borderRadius: 12, border: `1px solid ${G.border}`, background: G.bg2 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        {data.image && (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundImage: `url(${data.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
            }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            {data.name || "Untitled"}
          </div>
          <div style={{ fontSize: 12, color: G.t3, marginBottom: 8 }}>
            Source: {item.source_name} · Category:{" "}
            {item.suggested_category || "Unknown"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: G.t2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {data.short_desc || "No description"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          paddingTop: 12,
          borderTop: `1px solid ${G.border}`,
        }}
      >
        <button
          onClick={handleApprove}
          disabled={processing}
          className="premium-btn"
          style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, opacity: processing ? 0.5 : 1 }}
        >
          {processing ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={handleReject}
          disabled={processing}
          className="premium-btn"
          style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: 'transparent', opacity: processing ? 0.5 : 1 }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function IntelligenceTab({ notify }) {
  const [anomalies, setAnomalies] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [anomaliesRes, pendingRes] = await Promise.all([
        supabase
          .from("trend_anomalies")
          .select("*, items(name)")
          .eq("reviewed", false)
          .order("detected_at", { ascending: false })
          .limit(20),
        supabase
          .from("pending_items")
          .select("*")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false })
          .limit(20),
      ]);

      setAnomalies(anomaliesRes.data || []);
      setPendingItems(pendingRes.data || []);
    } catch (err) {
      console.error("Failed to fetch intelligence data:", err);
    }
    setLoading(false);
  }

  async function reviewAnomaly(anomalyId, isLegitimate) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase
        .from("trend_anomalies")
        .update({
          reviewed: true,
          is_legitimate: isLegitimate,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", anomalyId);

      // Log action
      await supabase.rpc("log_admin_action", {
        p_action: isLegitimate ? "APPROVE_ANOMALY" : "REJECT_ANOMALY",
        p_resource_type: "trend_anomaly",
        p_resource_id: anomalyId,
      });

      fetchData();
    } catch (err) {
      console.error("Failed to review anomaly:", err);
      notify?.("error", "Failed to review anomaly");
    }
  }

  async function approveItem(pendingId, itemData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert into items table
      const { data: newItem, error } = await supabase
        .from("items")
        .insert([{ ...itemData, approved: true }])
        .select()
        .single();

      if (error) throw error;

      // Update pending item
      await supabase
        .from("pending_items")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      // Log action
      await supabase.rpc("log_admin_action", {
        p_action: "APPROVE_ITEM",
        p_resource_type: "pending_item",
        p_resource_id: pendingId,
        p_new_value: newItem,
      });

      fetchData();
    } catch (err) {
      console.error("Failed to approve item:", err);
      notify?.("error", "Failed to approve item");
    }
  }

  async function rejectItem(pendingId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase
        .from("pending_items")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      // Log action
      await supabase.rpc("log_admin_action", {
        p_action: "REJECT_ITEM",
        p_resource_type: "pending_item",
        p_resource_id: pendingId,
      });

      fetchData();
    } catch (err) {
      console.error("Failed to reject item:", err);
      notify?.("error", "Failed to reject item");
    }
  }

  return (
    <div>
      {/* Anomalies Section */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
          Trend Anomalies
        </h2>
        <p style={{ fontSize: 14, color: G.t2, marginBottom: 20 }}>
          Unusual spikes or drops that may indicate bot activity or viral trends
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
            Loading anomalies...
          </div>
        ) : anomalies.length === 0 ? (
          <div className="premium-card"
            style={{
              textAlign: "center",
              padding: 60,
              background: G.bg2,
              border: `1px solid ${G.border}`,
              borderRadius: 12,
              color: G.t3,
            }}
          >
            No unreviewed anomalies
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {anomalies.map((anomaly) => (
              <AnomalyCard
                key={anomaly.id}
                anomaly={anomaly}
                onReview={reviewAnomaly}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending Items Section */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
          Pending Approval
        </h2>
        <p style={{ fontSize: 14, color: G.t2, marginBottom: 20 }}>
          New items waiting for manual review before going live
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: G.t3 }}>
            Loading pending items...
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="premium-card"
            style={{
              textAlign: "center",
              padding: 60,
              background: G.bg2,
              border: `1px solid ${G.border}`,
              borderRadius: 12,
              color: G.t3,
            }}
          >
            No items pending review
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {pendingItems.map((item) => (
              <PendingItemCard
                key={item.id}
                item={item}
                onApprove={approveItem}
                onReject={rejectItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
