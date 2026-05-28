import { AuthService } from '../../src/services/AuthService';
import User from '../../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a token for a given user ID', () => {
            process.env.JWT_SECRET = 'secret';
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            const token = authService.generateToken('user-123');

            expect(jwt.sign).toHaveBeenCalledWith({ id: 'user-123' }, 'secret', { expiresIn: '30d' });
            expect(token).toBe('mock-token');
        });
    });

    describe('login', () => {
        it('should login a user with correct credentials', async () => {
            const mockUser = {
                id: 'user-123',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashed-password'
            };

            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            const result = await authService.login({
                email: 'john@example.com',
                password: 'password123'
            });

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(result).toEqual({
                _id: 'user-123',
                name: 'John Doe',
                email: 'john@example.com',
                token: 'mock-token'
            });
        });

        it('should throw an error if the user is not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(authService.login({
                email: 'john@example.com',
                password: 'password123'
            })).rejects.toThrow('Invalid email or password');
        });
    });
});
