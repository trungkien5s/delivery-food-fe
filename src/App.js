import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import SocketTester from "./pages/SocketTester";
import HomePage from "./pages/homepage/HomePage";

function App() {
    return (
        <Provider store={store}>
            <Routes>
                {/*<Route path="/" element={<SocketTester />} />*/}
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Provider>
    );
}

export default App;