import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function PageShell() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="pt-[72px] flex-grow">
        <Outlet />
      </main>
    </div>
  )
}

