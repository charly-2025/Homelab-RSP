import { useState } from "react";

import "./Console.css";



function Console({setSelectedPage}) {

  return (
    <>
    <div className="console-container">
        <div className="console-content">
          <h1>Console</h1>
          <p>This is the console page. Here you can execute commands and view system logs.</p>
          <button className="button secondary back-btn" onClick={() => setSelectedPage('home')}>Retour</button>
          <iframe
            src="/ws/"
            style={{ width: "100%", height: "100vh", border: "none" }}
          />
        </div>
      </div>
    </>
  )
}

export default Console