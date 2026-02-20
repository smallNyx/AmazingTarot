import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Stars from './Stars'

export default function Layout() {
  return (
    <div className="min-h-screen relative">
      <Stars />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
