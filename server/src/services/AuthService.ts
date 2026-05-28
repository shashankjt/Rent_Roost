import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IAuthService, RegisterDTO, LoginDTO, AuthResponseDTO } from '../interfaces/IAuthService';

export class AuthService implements IAuthService {
    public generateToken(userId: string): string {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
            expiresIn: '30d',
        });
    }

    public async register(data: RegisterDTO): Promise<AuthResponseDTO> {
        const { name, email, password } = data;

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (!user) {
            throw new Error('Invalid user data');
        }

        return {
            _id: user.id,
            name: user.name,
            email: user.email,
            token: this.generateToken(user.id),
        };
    }

    public async login(data: LoginDTO): Promise<AuthResponseDTO> {
        const { email, password } = data;

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        return {
            _id: user.id,
            name: user.name,
            email: user.email,
            token: this.generateToken(user.id),
        };
    }
}
