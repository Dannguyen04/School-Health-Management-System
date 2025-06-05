import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin from "./pages/Admin";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";

// Create a QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
        <ToastContainer />
      </>
    </QueryClientProvider>
  );
};

export default App;
