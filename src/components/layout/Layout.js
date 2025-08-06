import SecondaryHeader from "./SecondaryHeader"

import Sidebar from "./Sidebar"
import MainHeader from "./MainHeader"
import Navigation from "./Navigation"
import Footer from "./Footer"
import AuthModal from "../../pages/auth/AuthModal"

export default function Layout({ children }) {
  return (
    <div>
      <SecondaryHeader />
      <MainHeader  />
      <Navigation />
      <div className="flex">
                    {/* <Sidebar /> */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
      <AuthModal />
      <Footer />
    </div>
  )
}
