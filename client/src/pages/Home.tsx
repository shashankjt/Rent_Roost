import { Search, MapPin, Calendar, Users, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Listing } from '../types/Listing';

const Home = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/listings');
                setListings(response.data);
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError('Failed to load listings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-[60vh] text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]">
                <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Cozy apartment"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>

                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                        Find your next <span className="text-indigo-400">perfect stay</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-10 drop-shadow-md">
                        Discover unique homes and experiences for your next trip. From cozy cottages to modern apartments.
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white p-2 rounded-full shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-4xl w-full sm:w-auto">
                        <div className="flex items-center px-4 py-2 w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200">
                            <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-left flex-1">
                                <label className="block text-xs font-bold text-gray-800">Location</label>
                                <input type="text" placeholder="Where are you going?" className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center px-4 py-2 w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-gray-200">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-left flex-1">
                                <label className="block text-xs font-bold text-gray-800">Check-in</label>
                                <input type="date" className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent" />
                            </div>
                        </div>
                        <div className="flex items-center px-4 py-2 w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-gray-200">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-left flex-1">
                                <label className="block text-xs font-bold text-gray-800">Check-out</label>
                                <input type="date" className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent" />
                            </div>
                        </div>
                        <div className="flex items-center px-4 py-2 w-full sm:w-48">
                            <Users className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-left flex-1">
                                <label className="block text-xs font-bold text-gray-800">Guests</label>
                                <input type="text" placeholder="Add guests" className="w-full text-sm text-gray-600 placeholder-gray-400 outline-none" />
                            </div>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full transition-colors shadow-md w-full sm:w-auto flex justify-center items-center">
                            <Search className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Dynamic Data Cards */}
                    {listings.map((item) => (
                        <Link to={`/listings/${item.id}`} key={item.id} className="group block">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold text-gray-800">{item.rating}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" /> {item.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-gray-900">${item.price}</span>
                                        <span className="text-gray-500">/ night</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
