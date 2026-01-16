import React, { useState } from 'react';
import axios from 'axios';
import { Search, Calendar, MapPin, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import API_URL from '../api/config';

const TrackBooking = () => {
    const [reference, setReference] = useState('');
    const [phone, setPhone] = useState('');
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBooking(null);
        setCancelSuccess(false);

        try {
            const response = await axios.post(`${API_URL}/api/bookings/track`, {
                bookingReference: reference.toUpperCase(),
                guestPhone: phone
            });
            setBooking(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to find booking.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

        setCancelLoading(true);
        try {
            await axios.post(`${API_URL}/api/bookings/guest-cancel`, {
                bookingReference: reference.toUpperCase(),
                guestPhone: phone
            });
            setCancelSuccess(true);
            // Refresh booking data
            const response = await axios.post(`${API_URL}/api/bookings/track`, {
                bookingReference: reference.toUpperCase(),
                guestPhone: phone
            });
            setBooking(response.data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel booking.');
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Booking</h1>
                <p className="text-gray-600">Enter your booking reference and phone number to view details.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <form onSubmit={handleTrack} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Booking Reference</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g. XR7B29"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter the phone number used for booking"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Find Booking'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-center">
                        {error}
                    </div>
                )}
            </div>

            {booking && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="relative h-48">
                        <img
                            src={booking.listing.image}
                            alt={booking.listing.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className={`px-4 py-1 rounded-full text-sm font-bold text-white uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                {booking.status}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.listing.title}</h2>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {booking.listing.location}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Price</p>
                                <p className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-in</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Check-out</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        {booking.status === 'confirmed' && (
                            <div className="border-t border-gray-100 pt-6">
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelLoading}
                                    className="w-full border-2 border-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors flex justify-center items-center gap-2"
                                >
                                    {cancelLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <>
                                            <XCircle className="h-5 w-5" />
                                            Cancel Booking
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Cancellation is subject to property policies.
                                </p>
                            </div>
                        )}

                        {cancelSuccess && (
                            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-center font-medium">
                                Booking cancelled successfully.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackBooking;
