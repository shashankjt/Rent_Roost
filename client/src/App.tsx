// Router configuration
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ListingDetails from './pages/ListingDetails.tsx';

import { AuthProvider } from './context/AuthContext';

import MyBookings from './pages/MyBookings';
import TrackBooking from './pages/TrackBooking';

import ErrorPage from './pages/ErrorPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "listings/:id", element: <ListingDetails /> },
      { path: "my-bookings", element: <MyBookings /> },
      { path: "track-booking", element: <TrackBooking /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
