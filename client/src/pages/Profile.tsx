import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, Calendar, MapPin, XCircle, User, Mail, Shield, DollarSign, Home, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../api/config';
import { getImageUrl } from '../utils/image';

interface Booking {
    _id: string;
    listing: {
        title: string;
        image: string;
        location: string;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: 'confirmed' | 'cancelled';
}

interface Listing {
    id: number;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    image: string;
}

const Profile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'bookings' | 'listings'>('bookings');
    const [bookingFilter, setBookingFilter] = useState<'upcoming' | 'active' | 'past'>('upcoming');

    // Fetch user's bookings
    const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['myBookings', user?._id],
        queryFn: async () => {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${API_URL}/api/bookings/my-bookings`, { headers });
            return response.data;
        },
        enabled: !!user,
    });

    // Fetch user's listed properties
    const { data: listings = [], isLoading: listingsLoading } = useQuery<Listing[]>({
        queryKey: ['myListings', user?._id],
        queryFn: async () => {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${API_URL}/api/listings/my-listings`, { headers });
            return response.data;
        },
        enabled: !!user,
    });

    // Cancel booking mutation
    const cancelMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, { headers });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        },
        onError: (err) => {
            console.error('Cancel booking error:', err);
            alert('Failed to cancel booking.');
        }
    });

    const handleCancelBooking = (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        cancelMutation.mutate(bookingId);
    };

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile.</h2>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold">Log In</Link>
            </div>
        );
    }

    // Filter Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkIn) > today);
    const activeBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkIn) <= today && new Date(b.checkOut) >= today);
    const pastBookings = bookings.filter(b => b.status === 'cancelled' || new Date(b.checkOut) < today);

    const getFilteredBookings = () => {
        switch (bookingFilter) {
            case 'upcoming': return upcomingBookings;
            case 'active': return activeBookings;
            case 'past': return pastBookings;
        }
    };

    // Calculate total spend
    const totalSpent = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    const loading = bookingsLoading || listingsLoading || cancelMutation.isPending;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            {/* User Profile Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-md uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-1 right-1 bg-green-500 border-4 border-white w-5 h-5 rounded-full" title="Online"></span>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
                        <p className="text-indigo-600 font-semibold text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                            <Shield className="w-4 h-4" /> Guest & Host Account
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start text-sm text-gray-500">
                        <span className="flex items-center gap-2 justify-center">
                            <User className="w-4 h-4 text-gray-400" /> ID: {user._id}
                        </span>
                        <span className="flex items-center gap-2 justify-center">
                            <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                        </span>
                    </div>
                </div>
            </div>

            {/* Travel / Host Statistics Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
                        <Compass className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Trips Reserved</p>
                        <h3 className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-green-50 text-green-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Expenditure</p>
                        <h3 className="text-2xl font-bold text-gray-900">${totalSpent}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Properties Hosted</p>
                        <h3 className="text-2xl font-bold text-gray-900">{listings.length}</h3>
                    </div>
                </div>
            </div>

            {/* Dashboard Tabs & Action Lists */}
            <div className="space-y-6">
                {/* Tabs Selectors */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'bookings'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Compass className="w-4 h-4" /> My Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'listings'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Home className="w-4 h-4" /> My Listings
                    </button>
                </div>

                {/* Tab Booking details */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        {/* Sub-Filters for Bookings */}
                        <div className="flex gap-2">
                            {(['upcoming', 'active', 'past'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setBookingFilter(filter)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${bookingFilter === filter
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter} ({filter === 'upcoming' ? upcomingBookings.length : filter === 'active' ? activeBookings.length : pastBookings.length})
                                </button>
                            ))}
                        </div>

                        {/* List Bookings */}
                        {getFilteredBookings()?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-gray-500 mb-4">No bookings found in this category.</p>
                                <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                                    Browse Properties
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {getFilteredBookings()?.map((booking) => (
                                    <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                        <img
                                            src={getImageUrl(booking.listing.image)}
                                            alt={booking.listing.title}
                                            className="w-full md:w-48 h-32 object-cover rounded-xl"
                                        />
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-gray-900">{booking.listing.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4" /> {booking.listing.location}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                                    <span>
                                                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg font-bold text-gray-900">
                                                    ${booking.totalPrice}
                                                </div>
                                            </div>

                                            {/* Show cancellation for confirmed upcoming bookings */}
                                            {booking.status === 'confirmed' && bookingFilter === 'upcoming' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-bold transition-colors cursor-pointer pt-2"
                                                >
                                                    <XCircle className="h-4 w-4" /> Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Listing Details */}
                {activeTab === 'listings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
                            <Link to="/list-property" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-md">
                                + Host Another Property
                            </Link>
                        </div>

                        {listings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
                                <Link to="/list-property" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                                    List Your First Property
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {listings.map((item) => (
                                    <Link to={`/listings/${item.id}`} key={item.id} className="group block">
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <div className="relative h-48 overflow-hidden">
                                                <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{item.title}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" /> {item.location}
                                                </p>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-bold text-gray-900">${item.price}</span>
                                                        <span className="text-gray-500 text-sm">/ night</span>
                                                    </div>
                                                    {item.rating > 0 && (
                                                        <div className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                                                            <Calendar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-bold">{item.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
