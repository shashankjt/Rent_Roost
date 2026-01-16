import API_URL from '../api/config';

export const getImageUrl = (path: string | undefined): string => {
    if (!path) return '';

    // Handle legacy localhost URLs from seed data
    if (path.includes('localhost:5000')) {
        return path.replace('http://localhost:5000', API_URL);
    }

    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // Ensure path starts with / if not present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
};
