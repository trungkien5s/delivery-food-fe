import { User, Phone } from "lucide-react"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import { useAppDispatch } from "../../redux/store/store"
import { logout, setAuthMode, setShowAuthModal } from "../../redux/store/slices/userSlice"

export default function SecondaryHeader() {
    const dispatch = useAppDispatch()
    const { isLoggedIn, user } = useAppSelector((state) => state.user)

  const handleAccountClick = () => {
    if (!isLoggedIn) {
      dispatch(setAuthMode("login"))
      dispatch(setShowAuthModal(true))
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }


  return (
    <div className="bg-green-600 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm">Chào mừng bạn đến với FoodLiver!</div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <User button onClick={handleAccountClick} className="w-4 h-4 cursor-pointer" />
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Xin chào, {user?.name}</span>
                <button onClick={handleLogout} className="text-sm hover:text-gray-200 ml-2">
                  (Đăng xuất)
                </button>
              </div>
            ) : (
              <button onClick={handleAccountClick} className="text-sm hover:text-gray-200">
                Tài khoản
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm">Hotline: 0376 940 811</span>
          </div>
        </div>
      </div>
    </div>
  )
}
