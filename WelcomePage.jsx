import React, { useState } from 'react';


function WelcomePage({ startGame }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>💸 Can You Beat the Headlines?</h1>
        <p style={styles.subtitle}>
          Read financial news, pick a portfolio, and see how your choices perform!
        </p>
        <button style={styles.button} onClick={startGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}
