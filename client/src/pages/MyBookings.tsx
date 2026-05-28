import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, MapPin, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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

const MyBookings = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [successMessage, setSuccessMessage] = useState('');
    const [bookingReference, setBookingReference] = useState('');
    const [error, setError] = useState('');

    // Fetch user bookings
    const { data: bookings = [], isLoading: bookingsLoading, refetch } = useQuery<Booking[]>({
        queryKey: ['myBookings', user?._id],
        queryFn: async () => {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${API_URL}/api/bookings/my-bookings`, { headers });
            return response.data;
        },
        enabled: !!user && !searchParams.get('session_id'),
    });

    // Payment verification mutation
    const verifyPaymentMutation = useMutation({
        mutationFn: async (sessionId: string) => {
            const response = await axios.post(`${API_URL}/api/payments/verify-session`, { sessionId });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccessMessage('Payment successful! Your booking is confirmed.');
            if (data.bookingReference) {
                setBookingReference(data.bookingReference);
            }
            setSearchParams({});
            if (user) {
                refetch();
            }
        },
        onError: (err) => {
            console.error('Payment verification error:', err);
            setError('Payment verification failed.');
        }
    });

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const token = user?.token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, { headers });
            return response.data;
        },
        onSuccess: () => {
            refetch();
        },
        onError: (err) => {
            console.error('Cancel booking error:', err);
            alert('Failed to cancel booking.');
        }
    });

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            verifyPaymentMutation.mutate(sessionId);
        }
    }, [searchParams]);

    const handleCancel = (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        cancelBookingMutation.mutate(bookingId);
    };

    const loading = bookingsLoading || verifyPaymentMutation.isPending || cancelBookingMutation.isPending;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user && !successMessage) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your bookings.</h2>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold">Log In</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Trips</h1>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">{successMessage}</span>
                    {bookingReference && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="font-bold">Booking Reference: <span className="text-xl">{bookingReference}</span></p>
                            <p className="text-sm mt-1">Save this code to track or cancel your booking later.</p>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 mb-4">No bookings found yet.</p>
                    <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            <img
                                src={getImageUrl(booking.listing.image)}
                                alt={booking.listing.title}
                                className="w-full md:w-48 h-32 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{booking.listing.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 flex items-center gap-2 mb-4 text-sm">
                                    <MapPin className="h-4 w-4" /> {booking.listing.location}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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

                                {booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleCancel(booking._id)}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-bold transition-colors cursor-pointer"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
