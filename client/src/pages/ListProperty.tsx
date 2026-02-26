import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Camera, MapPin, DollarSign, Home, CheckCircle } from 'lucide-react';
import API_URL from '../api/config';

const amenitiesList = [
    { id: 'wifi', label: 'Fast Wifi' },
    { id: 'parking', label: 'Free Parking' },
    { id: 'kitchen', label: 'Full Kitchen' },
    { id: 'pool', label: 'Private Pool' },
    { id: 'coffee', label: 'Coffee Maker' },
    { id: 'beach_access', label: 'Beach Access' },
    { id: 'fireplace', label: 'Indoor Fireplace' },
    { id: 'hiking', label: 'Hiking Trails' },
];

const availableImages = [
    'abby-rurenko-uOYak90r4L0-unsplash.jpg',
    'alejandra-cifre-gonzalez-ylyn5r4vxcA-unsplash.jpg',
    'andre-francois-mckenzie-08uIUe2a9XY-unsplash.jpg',
    'billy-jo-catbagan-SU4rZo7STQA-unsplash.jpg',
    'brian-babb-XbwHrt87mQ0-unsplash.jpg',
    'digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash.jpg',
    'john-fornander-Id7u0EkTjBE-unsplash.jpg',
    'phil-hearing-IYfp2Ixe9nM-unsplash.jpg',
    'todd-kent-178j8tJrNlc-unsplash.jpg'
];

const ListProperty = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        image: availableImages[0],
        amenities: [] as string[],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter(a => a !== id)
                : [...prev.amenities, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to list a property.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/listings`, {
                ...formData,
                price: Number(formData.price),
                image: `/images/${formData.image}`,
                images: [`/images/${formData.image}`]
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (response.status === 201) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to list property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto py-20 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Property Listed!</h2>
                <p className="text-gray-600">Your property has been successfully added to RentRoost. Redirecting you home...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
            <p className="text-gray-600 mb-8">Share your home with travelers from around the world.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Home className="h-5 w-5 text-indigo-500" /> Basic Information
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Luxury Beachfront Villa"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            placeholder="Describe your property, its unique features, and the neighborhood..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per night ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Malibu, CA"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {amenitiesList.map(amenity => (
                            <button
                                key={amenity.id}
                                type="button"
                                onClick={() => toggleAmenity(amenity.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${formData.amenities.includes(amenity.id)
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                {amenity.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Photo Selection */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-indigo-500" /> Cover Photo
                    </h2>
                    <p className="text-sm text-gray-500">Pick a professional photo for your listing.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {availableImages.map(img => (
                            <button
                                key={img}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                                className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${formData.image === img ? 'border-indigo-600' : 'border-transparent'
                                    }`}
                            >
                                <img src={`http://localhost:5000/images/${img}`} alt="Preview" className="w-full h-full object-cover" />
                                {formData.image === img && (
                                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                        <CheckCircle className="h-8 w-8 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Listing'}
                </button>
            </form>
        </div>
    );
};

export default ListProperty;
