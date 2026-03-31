import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            walletBalance: any;
            membership: any;
        };
    }>;
    register(data: any): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        walletBalance: number;
        membership: string;
        points: number;
        skillLevel: string | null;
        createdAt: Date;
    }>;
}
