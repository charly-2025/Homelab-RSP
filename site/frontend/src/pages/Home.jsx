import { useEffect, useState } from 'react'
import './Home.css'

/* Import Icon */
import powerOnIcon from "../images/power-off.svg"
import consoleIcon from "../images/console.svg"

function Home({ setSelectedPage }) {

    const [pc, setPc] = useState(null)

    const getPcStatus = async () => {
        try {
            const response = await fetch('/api/pc/status')
            const data = await response.json()

            setPc(data)
        }
        catch (error) {
            console.error(error)
        }
    }

    const wakePC = async () => {

        if (pc?.state !== "OFFLINE")
            return

        try {
            const response = await fetch('/api/wake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            console.log(data.message)

            getPcStatus()
        }
        catch (error) {
            console.error('Error waking PC:', error)
        }
    }

    useEffect(() => {

        getPcStatus()

        const interval = setInterval(getPcStatus, 2000)

        return () => clearInterval(interval)

    }, [])

    return (
        <div className="home-container">

            <div className="home-content">

                <h1>Welcome to the Control Interface</h1>

                <p>State : <strong>{pc?.state ?? "Loading..."}</strong></p>

                {
                    pc?.state === "STARTING" &&
                    <p>Starting... {pc?.session?.elapsed ?? 0}s</p>
                }

                {
                    pc?.system &&
                    <>
                        <p>CPU : {pc.system.cpu_percent}%</p>

                        <p>RAM : {pc.system.ram_percent}%</p>

                        <p>
                            Uptime :
                            {" "}
                            {pc.uptime.days}d
                            {" "}
                            {pc.uptime.hours}h
                            {" "}
                            {pc.uptime.minutes}m
                        </p>
                    </>
                }

                <button
                    className="home-btn-pc-powerOn"
                    onClick={wakePC}
                    disabled={pc?.state !== "OFFLINE"}
                >
                    <img src={powerOnIcon} alt="Power On" />
                    Power On
                </button>

                <button
                    className="home-btn-console"
                    onClick={() => setSelectedPage('console')}
                >
                    <img src={consoleIcon} alt="Console" />
                    Console
                </button>

            </div>

        </div>
    )
}

export default Home
