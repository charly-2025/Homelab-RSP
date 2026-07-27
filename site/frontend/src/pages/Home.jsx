import { useEffect, useRef, useState } from "react";
import "./Home.css";

/* Import Icon */
import powerOnIcon from "../images/power-off.svg";
import consoleIcon from "../images/console.svg";

function Home({ setSelectedPage }) {
  const STATE_LABELS = {
    MONITORING_OFF: "Monitoring Off",
    SHUTTING_DOWN: "Shutting Down",
    STARTING: "Starting",
    READY: "Ready",
    ONLINE: "Online",
    OFFLINE: "Offline",
    LOADING: "Loading",
  };
  const [monitoring, setMonitoring] = useState(false);

  const [pc, setPc] = useState(null);

  const [displayState, setDisplayState] = useState("MONITORING_OFF");

  const [powerLocked, setPowerLocked] = useState(true);

  const shutdownTimer = useRef(null);
  const polling = useRef(null);
  const monitoringRef = useRef(false);
  const previousBackendState = useRef(null);
  const shuttingDownRef = useRef(false);
  const wakePendingRef = useRef(false);

  async function getPcStatus() {
    if (!monitoringRef.current) return;

    try {
      const response = await fetch("/api/pc/status");
      if (!response.ok) {
        throw new Error("Backend error");
      }
      if (!monitoringRef.current) return;

      const data = await response.json();
      const previousState = previousBackendState.current;
      previousBackendState.current = data.state;

      if (!monitoringRef.current) return;

      setPc(data);
      if (wakePendingRef.current) {
        if (data.state === "OFFLINE") {
          return;
        }
      
        wakePendingRef.current = false;
      }

      /*
            ----------------------------------------
            SHUTTING DOWN
            ----------------------------------------
            */

      if (
        (previousState === "READY" || previousState === "ONLINE") &&
        data.state === "OFFLINE"
      ) {
        shuttingDownRef.current = true;
        setDisplayState("SHUTTING_DOWN");
        setPowerLocked(true);
        clearTimeout(shutdownTimer.current);
        shutdownTimer.current = setTimeout(() => {
          shuttingDownRef.current = false;
          setDisplayState("OFFLINE");
          setPowerLocked(false);
        }, 20000);
        return;
      }

      /*
            ----------------------------------------
            Cancel shutdown
            ----------------------------------------
            */

      if (
        shuttingDownRef.current &&
        (data.state === "READY" || data.state === "ONLINE")
      ) {
        clearTimeout(shutdownTimer.current);
        shuttingDownRef.current = false;
        setDisplayState(data.state);
        setPowerLocked(true);
      }
      /*
            ----------------------------------------
            Backend state
            ----------------------------------------
            */

      if (!shuttingDownRef.current) {
        setDisplayState(data.state);
      }

      /*
            ----------------------------------------
            Unlock Power Button
            ----------------------------------------
            */

      if (wakePendingRef.current) {
        setPowerLocked(true);
      } else if (
        data.state === "OFFLINE" &&
        !shuttingDownRef.current
      ) {
        setPowerLocked(false);
      } else {
        setPowerLocked(true);
      }
    } catch (err) {
      console.error(err);
    
      wakePendingRef.current = false;
    
      if (!monitoringRef.current) {
        return;
      }
    
      setPc(null);
      setDisplayState("OFFLINE");
      setPowerLocked(false);
    }
  }
  const wakePC = async () => {
    if (powerLocked) return;
  
    wakePendingRef.current = true;
    setPowerLocked(true);
    setDisplayState("STARTING");
  
    try {
      const response = await fetch("/api/wake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      let data = {};
    
      try {
        data = await response.json();
      } catch (_) {}
    
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
    
      console.log(data.message);
    
    } catch (err) {
      console.error(err);
    
      wakePendingRef.current = false;
      setPowerLocked(false);
      setDisplayState("OFFLINE");
    }
  };


  const stopMonitoring = () => {
    clearInterval(polling.current);
    clearTimeout(shutdownTimer.current);

    previousBackendState.current = null;
    shuttingDownRef.current = false;

    setMonitoring(false);
    setPc(null);
    setDisplayState("MONITORING_OFF");
    setPowerLocked(true);
  };

  useEffect(() => {
    if (!monitoring) return;
    getPcStatus();
    polling.current = setInterval(getPcStatus, 2000);
    return () => {
      clearInterval(polling.current);
      clearTimeout(shutdownTimer.current);
    };
  }, [monitoring]);

  useEffect(() => {
    return () => {
      clearInterval(polling.current);

      clearTimeout(shutdownTimer.current);
    };
  }, []);

  useEffect(() => {
    monitoringRef.current = monitoring;
  }, [monitoring]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Control Interface</h1>

        <p>
          Monitoring : <strong>{monitoring ? "ON" : "OFF"}</strong>
        </p>

        <p>
          State : <strong>{STATE_LABELS[displayState] || displayState}</strong>
        </p>

        {monitoring &&
          displayState === "STARTING" &&
          pc?.session?.elapsed != null && (
            <p>Starting Time : {pc.session.elapsed}s</p>
          )}

        {monitoring && pc?.system && (
          <>
            <p>CPU : {pc.system.cpu_percent}%</p>

            <p>RAM : {pc.system.ram_percent}%</p>

            <p>
              Uptime : {pc.uptime.days}d {pc.uptime.hours}h {pc.uptime.minutes}m
            </p>
          </>
        )}

        <button onClick={monitoring ? stopMonitoring : startMonitoring}>
          {monitoring ? "Stop Monitoring" : "Start Monitoring"}
        </button>

        <button
          className="home-btn-pc-powerOn"
          onClick={wakePC}
          disabled={!monitoring || powerLocked}
        >
          <img src={powerOnIcon} alt="Power On" />
          Power On
        </button>

        <button
          className="home-btn-console"
          onClick={() => setSelectedPage("console")}
        >
          <img src={consoleIcon} alt="Console" />
          Console
        </button>
      </div>
    </div>
  );
}

export default Home;
