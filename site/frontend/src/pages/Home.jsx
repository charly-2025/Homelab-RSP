import {useState} from 'react'
import './Home.css'

/*Import Icon*/
import powerOnIcon from "../images/power-off.svg"
import consoleIcon from "../images/console.svg"

function Home({ setSelectedPage }) {

  const wakePC = async () => {
    try {
      const response = await fetch('/api/wake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error waking PC:', error);
    }
  };

  return (
    <>
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Control Interface</h1>
        <p>This interface allows you to manage and control various aspects of your system.</p>
        <p>Use the navigation menu to access different features and settings.</p>
        <button className="home-btn-pc-powerOn" onClick={wakePC}>
          <img src={powerOnIcon} alt="Power On" />
          Power On
        </button>
        <button className="home-btn-console" onClick={() => setSelectedPage('console')}>
          <img src={consoleIcon} alt="Console" />
          Console
        </button>
      </div>
    </div>
    </>
  )
}

export default Home