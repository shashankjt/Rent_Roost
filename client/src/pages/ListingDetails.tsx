import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Wifi, Car, Coffee, Utensils, Waves, Umbrella, Flame, Mountain, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { Listing } from '../types/Listing';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API_URL from '../api/config';
import { getImageUrl } from '../utils/image';

const amenityIcons: Record<string, React.ElementType> = {
    wifi: Wifi,
    parking: Car,
    coffee: Coffee,
    kitchen: Utensils,
    pool: Waves,
    beach_access: Umbrella,
    fireplace: Flame,
    hiking: Mountain,
};

const amenityLabels: Record<string, string> = {
    wifi: 'Fast Wifi',
    parking: 'Free parking',
    coffee: 'Coffee maker',
    kitchen: 'Full kitchen',
    pool: 'Private pool',
    beach_access: 'Beach access',
    fireplace: 'Indoor fireplace',
    hiking: 'Hiking trails',
};

const ListingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    // Booking State
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [bookingError, setBookingError] = useState('');

    // Fetch listing details using React Query
    const { data: listing, isLoading: listingLoading, error: listingError } = useQuery<Listing>({
        queryKey: ['listing', id],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/listings/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    // Fetch unavailable dates using React Query
    const { data: unavailableDates = [], isLoading: datesLoading } = useQuery<{ checkIn: string; checkOut: string }[]>({
        queryKey: ['unavailableDates', id],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api/bookings/unavailable-dates/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    // Booking Mutation using React Query
    const bookingMutation = useMutation({
        mutationFn: async (bookingData: any) => {
            const response = await axios.post(`${API_URL}/api/payments/create-checkout-session`, bookingData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            } else {
                setBookingError('Failed to create payment session');
            }
        },
        onError: (err: any) => {
            console.error('Booking Error:', err);
            if (err.response) {
                setBookingError(err.response.data.message || 'Server error during booking.');
            } else if (err.request) {
                setBookingError('Network error. Please check your connection.');
            } else {
                setBookingError(err.message || 'Booking initialization failed.');
            }
        }
    });

    const getBlockedDates = () => {
        const blockedDates: Date[] = [];
        unavailableDates.forEach(booking => {
            let currentDate = new Date(booking.checkIn);
            const endDate = new Date(booking.checkOut);

            while (currentDate < endDate) {
                blockedDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
        return blockedDates;
    };

    const handleBooking = () => {
        if (!checkIn || !checkOut) {
            setBookingError('Please select check-in and check-out dates.');
            return;
        }

        if (checkIn >= checkOut) {
            setBookingError('Check-out date must be after check-in date.');
            return;
        }

        if (!user && (!guestName || !guestPhone)) {
            setBookingError('Please enter your name and phone number.');
            return;
        }

        setBookingError('');
        const token = user?.token;
        const totalPrice = listing ? listing.price * 5 + 130 : 0;

        bookingMutation.mutate({
            listingId: Number(id),
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            totalPrice,
            guestName: user ? undefined : guestName,
            guestPhone: user ? undefined : guestPhone,
            guestEmail: user ? undefined : 'guest@example.com',
            userToken: token
        });
    };

    if (listingLoading || datesLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (listingError || !listing) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to load listing details</h2>
                <p className="text-gray-600 mb-8">The property you are looking for does not exist.</p>
                <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Go back home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to listings
            </Link>

            {/* Header Images */}
            <div className="rounded-3xl overflow-hidden shadow-lg mb-8 h-[400px] sm:h-[500px] relative group">
                <img
                    src={getImageUrl(listing.image)}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                />
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-white transition-colors">
                    View all photos
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {listing.location}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                    <span className="text-lg font-bold">{listing.rating}</span>
                                    <span className="text-gray-400 text-sm">({listing.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-6 flex items-center gap-4">
                        <img
                            src={getImageUrl(listing.host.image)}
                            alt={listing.host.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                            <p className="text-sm text-gray-500">Hosted by</p>
                            <p className="font-bold text-gray-900">{listing.host.name}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About this place</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {listing.amenities.map((amenity) => {
                                const Icon = amenityIcons[amenity] || Star;
                                const label = amenityLabels[amenity] || amenity;
                                return (
                                    <div key={amenity} className="flex items-center gap-3 text-gray-600">
                                        <Icon className="h-5 w-5 text-indigo-500" />
                                        <span className="capitalize">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="text-2xl font-bold text-gray-900">${listing.price}</span>
                                <span className="text-gray-500"> / night</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold">{listing.rating}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-gray-300 rounded-lg p-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
                                    <DatePicker
                                        selected={checkIn}
                                        onChange={(date) => setCheckIn(date)}
                                        selectsStart
                                        startDate={checkIn}
                                        endDate={checkOut}
                                        minDate={new Date()}
                                        excludeDates={getBlockedDates()}
                                        placeholderText="Select date"
                                        className="w-full text-sm outline-none text-gray-700"
                                    />
                                </div>
                                <div className="border border-gray-300 rounded-lg p-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out</label>
                                    <DatePicker
                                        selected={checkOut}
                                        onChange={(date) => setCheckOut(date)}
                                        selectsEnd
                                        startDate={checkIn}
                                        endDate={checkOut}
                                        minDate={checkIn || new Date()}
                                        excludeDates={getBlockedDates()}
                                        placeholderText="Select date"
                                        className="w-full text-sm outline-none text-gray-700"
                                    />
                                </div>
                            </div>

                            {!user && (
                                <div className="space-y-3 pt-2">
                                    <p className="text-sm font-medium text-gray-900">Guest Details</p>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {bookingError && (
                            <div className="text-red-500 text-sm mb-4 text-center">{bookingError}</div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={bookingMutation.isPending}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center cursor-pointer"
                        >
                            {bookingMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reserve'}
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4">You won't be charged yet</p>

                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>${listing.price} x 5 nights</span>
                                <span>${listing.price * 5}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cleaning fee</span>
                                <span>$50</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Service fee</span>
                                <span>$80</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span>${listing.price * 5 + 50 + 80}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetails;
