import { Request, Response } from 'express';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthController {
    constructor(private authService: IAuthService) {}

    public signup = async (req: Request, res: Response): Promise<void> => {
        const { name, email, password } = req.body;

        try {
            if (!name || !email || !password) {
                res.status(400).json({ message: 'Please provide all required fields' });
                return;
            }

            const result = await this.authService.register({ name, email, password });
            res.status(201).json(result);
        } catch (error: any) {
            if (error.message === 'User already exists') {
                res.status(400).json({ message: error.message });
            } else if (error.message === 'Invalid user data') {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };

    public login = async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                res.status(400).json({ message: 'Please provide all required fields' });
                return;
            }

            const result = await this.authService.login({ email, password });
            res.json(result);
        } catch (error: any) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };
}
