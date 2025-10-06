import React, { useState } from "react";

// Teste com React puro (DOM elements) ao invés de React Native
export default function PureReactApp() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Pure React funcionando!");

  console.log("PureReactApp renderizando - count:", count);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        🧪 Teste Pure React
      </h1>

      <p
        style={{
          fontSize: "16px",
          textAlign: "center",
          marginBottom: "20px",
          color: "#666",
        }}
      >
        {message}
      </p>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "2px solid #4CAF50",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#4CAF50",
          }}
        >
          Count: {count}
        </span>
      </div>

      <button
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "15px 30px",
          borderRadius: "10px",
          border: "none",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => {
          setCount(count + 1);
          setMessage(`Botão clicado ${count + 1} vezes!`);
        }}
      >
        + Incrementar
      </button>
    </div>
  );
}
