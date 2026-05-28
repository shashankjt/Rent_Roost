// Router configuration
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ListingDetails from './pages/ListingDetails.tsx';

import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MyBookings from './pages/MyBookings';
import TrackBooking from './pages/TrackBooking';
import ListProperty from './pages/ListProperty';
import Profile from './pages/Profile';

import ErrorPage from './pages/ErrorPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

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
      { path: "list-property", element: <ListProperty /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
