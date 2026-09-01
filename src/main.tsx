import { createRoot } from "react-dom/client";
import "./index.css";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Homepage from "./pages/Homepage";
import Register from "./pages/Register";
import About from "./pages/About";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Artikel from "./pages/Artikel";
import ArtikelDetail from "./pages/ArtikelDetail";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/ProtectedRoute";
import Layanan from "./pages/Layanan";
import Mitra from "./components/Mitra";
import Location from "./pages/Location";
import ProductDetail from "./pages/ProductDetail";
import Teams from "./pages/Teams";
import Promo from "./components/Promo";
import CreateBlog from "./pages/CreateBlog";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "product",
        element: <Product />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "artikel",
        element: <Artikel />,
      },
       {
        path: "mitra",
        element: <Mitra />,
      },
      {
        path: "promo",
        element: <Promo />,
      },
      {
        path: "artikel/:objectId",
        element: <ArtikelDetail />,
      },
      {
        path: "location",
        element: <Location />,
      },
      {
        path: "teams",
        element: <Teams />,
      },
      {
        path: "product/:objectId",
        element: <ProductDetail />,
      },
     {
  path: "contact",
  element: (
    <ProtectedRoute>
      <Contact />
    </ProtectedRoute> 
  ),
},
{
  path: "create-blog",
  element: (
    <ProtectedRoute>
      <CreateBlog />
    </ProtectedRoute> 
  ),
},
 {
        path: "layanan",
        element: <Layanan />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);