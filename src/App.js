import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import SocketTester from "./pages/SocketTester";
import HomePage from "./pages/homepage/HomePage";
import { IntroPage } from "./pages/IntroPage/IntroPage";

function App() {
    return (
        <Provider store={store}>
            <Routes>
                {/*<Route path="/" element={<SocketTester />} />*/}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<IntroPage />} />
            </Routes>
        </Provider>
    );
}

export default App;