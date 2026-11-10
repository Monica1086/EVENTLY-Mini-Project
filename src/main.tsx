
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

// Pages
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerTransactions from "./pages/organizer/OrganizerTransactions";

import CustomerTransactions from "./pages/CustomerTransactions";
import CustomerDashboard from "./pages/CustomerDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import OrganizerLayout from "./components/organizer/OrganizerLayout";
import OrganizerAttendees from "./pages/organizer/OrganizerAttendees";
import OrganizerSalesReport from "./pages/organizer/OrganizerSalesReport";
import OrganizerVouchers from "./pages/organizer/OrganizerVouchers";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import MyTickets from "./pages/MyTickets";

const router = createBrowserRouter([
  // =========================
  // PUBLIC ROUTES
  // =========================
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/events/:id",
    element: <EventDetail />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
  path: "/customer/my-tickets",
  element: <MyTickets />,
},

  // =========================
  // ORGANIZER ROUTES
  // =========================
  {
    element: <ProtectedRoute allowedRoles={["organizer"]} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          {
            path: "/organizer/dashboard",
            element: <OrganizerDashboard />,
          },
          {
            path: "/organizer/transactions",
            element: <OrganizerTransactions />,
          },
          {
  path: "/organizer/attendees",
  element: <OrganizerAttendees />,
},
{
  path: "/organizer/salesreport",
  element: <OrganizerSalesReport />,
},
{
  path: "/organizer/vouchers",
  element: <OrganizerVouchers />,
},
{
  path: "/organizer/events",
  element: <OrganizerEvents />,
},
{
  path: "/organizer/events/new",
  element: <OrganizerCreateEvent />,
},
{
  path: "/organizer/events/:id/edit",
  element: <OrganizerCreateEvent />,
},
{
  path: "/organizer/profile",
  element: <Profile />,
},
        ],
      },
    ],
  },

  // =========================
  // CUSTOMER ROUTES
  // =========================
  {
    element: <ProtectedRoute allowedRoles={["customer"]} />,
    children: [
      {
        path: "/customer/transactions",
        element: <CustomerTransactions />,
      },
      {
        path: "/customer/dashboard",
        element: <CustomerDashboard />,
      },
      {
  path: "/customer/profile",
  element: <Profile />,
},
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
