import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route path="/products" element={<Products />} />

                    <Route path="/orders/create" element={<CreateOrder />} />

                    <Route path="/orders" element={<Orders />} />

                
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;