import React, { useState } from 'react';
import WelcomePage from './WelcomePage';
//import FinanceGame from './FinanceGame';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div>
      {!started ? (
        <WelcomePage startGame={() => setStarted(true)} />
      ) : (
        <FinanceGamePage documents={documentsData} portfolios={portfoliosData} />
      )}
    </div>
  );
}

export default App;