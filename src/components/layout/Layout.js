import AuthModal from "../../pages/auth/AuthModal";
import Footer from "./Footer";
import MainHeader from "./MainHeader";
import Navigation from "./Navigation";
import SecondaryHeader from "./SecondaryHeader";

export default function Layout({ children }) {
  return (
    <div>
      <div className="sticky top-0 z-50">
      <SecondaryHeader />
        <MainHeader />
        <Navigation />
      </div>
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
