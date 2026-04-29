import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// ✅ ONE Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// ✅ ONE Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// ✅ ONE Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// ✅ Other CSS (keep these)
import "./assets/css/elegant-icons.css";
import "./assets/css/magnific-popup.css";
import "./assets/css/nice-select.css";
import "./assets/css/owl.carousel.min.css";
import "./assets/css/slicknav.min.css";

// ✅ Your custom SCSS — MUST BE LAST so it overrides everything
import './styles/sass/style.scss';
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CompareProvider } from "./context/CompareContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
              <App />
            </GoogleOAuthProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
)