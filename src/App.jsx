import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
// Components
import Preloader from "./components/Preloader";
import OffcanvasMenu from "./components/OffcanvasMenu";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Banner from "./components/Banner";
import Categories from "./components/Category";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
// Pages
import About from "./pages/About";
import Home from "./pages/Home";
import Product from "./pages/Productsection";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Register from './pages/Register';
import Collection from "./pages/Collection";
import CollectionProducts from "./pages/CollectionProducts";
import Compare from "./pages/Compare";
// import CategoryPage from "./pages/CategoryPage";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>

      <ScrollToTop />
      {loading && <Preloader />}

      {!isAdminRoute && (
        <OffcanvasMenu
          isOpen={isMenuOpen}
          closeMenu={() => setIsMenuOpen(false)}
        />
      )}

      {!isAdminRoute && (
        <Header openMenu={() => setIsMenuOpen(true)} />
      )}

      <Routes>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Categories />
              <Home />
              <Product />
              <Banner />

            </>
          }
        />

        {/* STATIC PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* BLOG */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />

        {/* SHOP */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collection/:type" element={<CollectionProducts />} />

        {/* PRODUCT DETAILS PAGE (NEW) */}
        <Route path="/product/:id" element={<ProductDetails />} />
        {/* <Route path="/shop-details" element={<ShopDetails />} /> */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/compare" element={<Compare />} />
        {/* CART & CHECKOUT */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;