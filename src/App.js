import { Routes, Route } from "react-router-dom";
import SocketTester from "./pages/SocketTester";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";

function App() {
    return (
        <Routes>
            {/*<Route path="/" element={<SocketTester />} />*/}
            <Route path = "/auth/sign-in" element={<SignInPage/>} />
            <Route path = "/auth/sign-up" element={<SignUpPage/>} />
        </Routes>
    );
}

export default App;
