import React, { useState } from 'react';


function WelcomePage({ startGame }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}> Learn to read the market through real financial news</h1>
        <p style={styles.subtitle}>
          Read financial news, pick a portfolio, and see how your choices perform!
        </p>
        <button style={styles.button} onClick={startGame}>
          Start Game
        </button>
      </div>
      <div style={styles.learnBox}>
        <h3 style={styles.learnTitle}>What you will learn</h3>
        <ul style={styles.learnList}>
          <li style={styles.learnItem}>How to identify bullish vs bearish sentiment in financial news</li>
          <li style={styles.learnItem}>Understanding the relationship between news signals and stock performance</li>
          <li style={styles.learnItem}>Portfolio management strategies</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundColor: "#0f172a", // dark slate
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    backgroundColor: "#020617", // near-black
    padding: "48px",
    borderRadius: "16px",
    width: "420px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    border: "1px solid #1e293b",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginBottom: "36px",
    lineHeight: "1.6",
  },
  button: {
    backgroundColor: "#2563eb", // clean blue accent
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "14px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  learnBox: {
  backgroundColor: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "32px",
  textAlign: "left",
},

learnTitle: {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#e5e7eb",
  marginBottom: "12px",
},

learnList: {
  listStyleType: "disc",
  paddingLeft: "20px",
  color: "#94a3b8",
  fontSize: "0.95rem",
  lineHeight: "1.6",
}
};

export default WelcomePage;

