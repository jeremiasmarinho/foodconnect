import React, { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("🎉 REACT PURO FUNCIONANDO!");

  console.log("React App renderizando - count:", count);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 FoodConnect - React Puro</h1>
        <p>{message}</p>

        <div className="counter-container">
          <div className="counter">Count: {count}</div>
        </div>

        <button
          className="increment-button"
          onClick={() => {
            setCount(count + 1);
            setMessage(`Hooks funcionando! Count: ${count + 1}`);
          }}
        >
          + Incrementar
        </button>

        <div className="stories-preview">
          <h2>📖 Stories Preview</h2>
          <div className="story-rings">
            <div className="story-ring">Você</div>
            <div className="story-ring">Maria</div>
            <div className="story-ring">João</div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
