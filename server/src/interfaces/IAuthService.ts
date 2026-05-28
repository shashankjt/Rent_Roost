export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    _id: string;
    name: string;
    email: string;
    token: string;
}

export interface IAuthService {
    register(data: RegisterDTO): Promise<AuthResponseDTO>;
    login(data: LoginDTO): Promise<AuthResponseDTO>;
    generateToken(userId: string): string;
}
