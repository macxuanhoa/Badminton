import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function PageShell() {
  return (
    <div className="w-full min-h-screen bg-app text-app flex flex-col relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] bg-[url('/images/bg-court-lines.svg')] bg-top bg-no-repeat bg-[length:1600px_1200px]" />
      <Navbar />
      <main className="pt-[72px] flex-grow">
        <Outlet />
      </main>
    </div>
  )
}
