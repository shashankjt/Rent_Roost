import { Outlet, Link } from 'react-router-dom';
import { User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                                <img src="/Logo.jpg" alt="RentRoost Logo" className="h-10 w-auto object-contain" />
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Explore</Link>
                            <Link to="/my-bookings" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Trips</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <span className="text-sm font-medium text-gray-700">Hello, {user.name}</span>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/track-booking" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                                        Track Booking
                                    </Link>
                                    <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </Link>
                                    <Link to="/signup" className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-md shadow-sm">
                                        <User className="h-4 w-4" />
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} RentRoost. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
