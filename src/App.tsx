import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import DistrictSelection from "./pages/DistrictSelection";

// Helper to check if location is set
const hasLocation = () => !!localStorage.getItem('alshbh_selected_location');
import Cart from "./pages/Cart";
import Restaurants from "./pages/Restaurants";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import RestaurantDetails from "./pages/RestaurantDetails";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Search from "./pages/Search";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import EditProfile from "./pages/EditProfile";
import MyStats from "./pages/MyStats";
import About from "./pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DistrictSelection />} />
          <Route path="/home" element={<Index />} />
          <Route path="/select-location" element={<DistrictSelection />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/my-stats" element={<MyStats />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;