// components/shared/ErrorBoundary.js
// Wobl — catches client-side render crashes. pages/500.js only handles
// server-side errors; a runtime error in a React component (bad data
// shape, a null reference, etc.) currently has nothing catching it,
// meaning a blank or broken page with no way back. This fixes that.

import { Component } from "react";
import { W, glassPanel } from "./wobl-theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") window.location.href = "/movies";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2rem",
            background: W.bg,
          }}
        >
          <div
            style={{
              ...glassPanel,
              borderRadius: W.radius,
              padding: "2rem",
              textAlign: "center",
              maxWidth: 380,
            }}
          >
            <div
              style={{
                fontFamily: W.monoFont,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: W.marquee,
                marginBottom: 10,
              }}
            >
              Something went wrong
            </div>
            <p
              style={{
                fontFamily: W.bodyFont,
                fontSize: 14,
                color: W.creamDim,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              This part of the page hit a snag. Nothing's lost — let's get you
              back.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: W.marquee,
                color: "#0A0908",
                fontFamily: W.bodyFont,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to Movies
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
