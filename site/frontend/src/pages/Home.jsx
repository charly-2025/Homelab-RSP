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

  /* ---------- Raspberry Pi local (stats + ventilateur) ---------- */
  const [rsp, setRsp] = useState(null);
  const rspPolling = useRef(null);

  const [fanSpeed, setFanSpeed] = useState(0);
  const [fanSyncing, setFanSyncing] = useState(false);
  const fanDebounce = useRef(null);

  async function getRspStatus() {
    try {
      const response = await fetch("/api/rsp/status");
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setRsp(data);
    } catch (err) {
      console.error(err);
      setRsp(null);
    }
  }

  const sendFanSpeed = async (value) => {
    setFanSyncing(true);
    try {
      const response = await fetch("/api/rsp/fan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed: value }),
      });
      if (!response.ok) throw new Error("Erreur backend ventilateur");
    } catch (err) {
      console.error(err);
    } finally {
      setFanSyncing(false);
    }
  };

  const handleFanChange = (e) => {
    const value = Number(e.target.value);
    setFanSpeed(value);

    clearTimeout(fanDebounce.current);
    fanDebounce.current = setTimeout(() => sendFanSpeed(value), 300);
  };

  // Récupère la vitesse actuelle du ventilateur au montage (pour ne pas
  // partir sur une valeur arbitraire alors qu'une vitesse est déjà en place)
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/rsp/fan");
        if (!response.ok) return;
        const data = await response.json();
        if (typeof data.speed === "number") setFanSpeed(data.speed);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Polling des stats du Pi : indépendant du monitoring du PC distant,
  // le Pi tourne en permanence puisque c'est lui qui héberge le backend.
  useEffect(() => {
    getRspStatus();
    rspPolling.current = setInterval(getRspStatus, 5000);
    return () => clearInterval(rspPolling.current);
  }, []);

  /* ---------- PC distant (wake-on-lan) ---------- */

  async function getPcStatus() {
    if (!monitoringRef.current) return;

    try {
      const response = await fetch("/api/pc/status");
      if (!response.ok) {
        throw new Error("Backend error");
      }
      if (!monitoringRef.current) return;

      const data = await response.json();
      console.log("status =", data.state);
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
      } else if (data.state === "OFFLINE" && !shuttingDownRef.current) {
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

      console.log("wake catch", err.message);
      wakePendingRef.current = false;
      setPowerLocked(false);

      if (err.message === "PC is already running or starting.") {
        getPcStatus();
        return;
      }

      setDisplayState("OFFLINE");
    }
  };

  const startMonitoring = () => {
    setMonitoring(true);
    setDisplayState("LOADING");
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
      clearInterval(rspPolling.current);
      clearTimeout(shutdownTimer.current);
      clearTimeout(fanDebounce.current);
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
            <p>CPU (PC) : {pc.system.cpu_percent}%</p>
            <p>RAM (PC) : {pc.system.ram_percent}%</p>
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

        {/* Stats du Raspberry Pi : toujours visibles, indépendantes du monitoring PC */}
        {rsp && (
          <div className="home-card home-card-stats">
            <h2>Statistiques Raspberry Pi</h2>

            <div className="stat-row">
              <span className="stat-label">CPU</span>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${rsp.cpu_percent}%` }}
                />
              </div>
              <span className="stat-value">{rsp.cpu_percent}%</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">RAM</span>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${rsp.ram_percent}%` }}
                />
              </div>
              <span className="stat-value">{rsp.ram_percent}%</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Stockage</span>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${rsp.disk_percent}%` }}
                />
              </div>
              <span className="stat-value">{rsp.disk_percent}%</span>
            </div>
          </div>
        )}

        <div className="home-card home-card-fan">
          <h2>
            Ventilateur {fanSyncing && <span className="fan-syncing">↻</span>}
          </h2>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={fanSpeed}
            onChange={handleFanChange}
            className="fan-slider"
          />
          <span className="stat-value">{fanSpeed}%</span>
        </div>
      </div>
    </div>
  );
}

export default Home;