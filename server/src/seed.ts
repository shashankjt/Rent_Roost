import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Listing from './models/Listing';
import fs from 'fs';
import path from 'path';

dotenv.config();

const adjectives = ['Cozy', 'Modern', 'Luxury', 'Chic', 'Rustic', 'Spacious', 'Serene', 'Urban', 'Secluded', 'Vintage', 'Sunny', 'Elegant', 'Minimalist'];
const types = ['Apartment', 'Cabin', 'Villa', 'Loft', 'Cottage', 'Bungalow', 'Penthouse', 'Studio', 'Retreat', 'Tiny Home', 'Mansion'];
const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Miami, FL', 'Denver, CO', 'Portland, OR', 'San Francisco, CA', 'Nashville, TN', 'Boston, MA', 'New Orleans, LA'];
const amenitiesList = ["wifi", "parking", "kitchen", "pool", "hottub", "gym", "ac", "heating", "tv", "washer_dryer", "fireplace", "beach_access", "hiking"];
const hostNames = ['Alice Smith', 'John Doe', 'Emma Wilson', 'Michael Brown', 'Sophia Davis', 'James Miller', 'Olivia Taylor', 'William Anderson'];

const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomSubset = (arr: string[], size: number) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
};

const importData = async () => {
    try {
        await connectDB();

        // Get all images from the directory
        const imagesDir = path.join(__dirname, '../data/House Images');
        const imageFiles = fs.readdirSync(imagesDir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

        console.log(`Found ${imageFiles.length} images. Generating listings...`);

        const listings = imageFiles.map((fileName, index) => {
            const title = `${getRandomElement(adjectives)} ${getRandomElement(types)}`;
            const price = getRandomInt(80, 800);
            const rating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
            const reviews = getRandomInt(10, 500);
            const location = getRandomElement(locations);
            const hostName = getRandomElement(hostNames);
            const amenities = getRandomSubset(amenitiesList, getRandomInt(3, 8));

            // Pick a random second image for the gallery, ensuring it's not the same as the main image
            let secondImageIndex = getRandomInt(0, imageFiles.length - 1);
            while (secondImageIndex === index && imageFiles.length > 1) {
                secondImageIndex = getRandomInt(0, imageFiles.length - 1);
            }
            const secondImage = imageFiles[secondImageIndex];

            return {
                id: index + 1, // Simple numeric ID
                title: title,
                description: `Experience the best of ${location} in this ${title.toLowerCase()}. Perfect for travelers looking for comfort and style. Enjoy local attractions and relax in a beautiful setting.`,
                price: price,
                rating: Number(rating),
                reviews: reviews,
                location: location,
                image: `http://localhost:5000/images/${fileName}`,
                host: {
                    name: hostName,
                    image: `https://i.pravatar.cc/150?u=${index}`
                },
                amenities: amenities,
                images: [
                    `http://localhost:5000/images/${fileName}`,
                    `http://localhost:5000/images/${secondImage}`
                ]
            };
        });

        await Listing.deleteMany();
        console.log('Data Destroyed...');

        await Listing.insertMany(listings);
        console.log(`Imported ${listings.length} listings!`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

importData();
