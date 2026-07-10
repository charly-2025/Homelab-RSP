import { useState,useEffect } from 'react'

import Home from './pages/Home.jsx'
import Console from './pages/Console.jsx'

function App() {

  const [selectedPage, setSelectedPage] = useState(localStorage.getItem('selectedPage') || 'home');
  
  useEffect(() => {
    localStorage.setItem('selectedPage', selectedPage);
    console.log("Selected page:", selectedPage);
  }, [selectedPage])


  if (selectedPage === 'home') {
    return <Home setSelectedPage={setSelectedPage} />
  }

  if (selectedPage === 'console') {
    return <Console setSelectedPage={setSelectedPage} />
  }

  return (
    <>
    <h1>Page not found</h1>
    </>
  )
}

export default App
