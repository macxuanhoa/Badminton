import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
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
    register(body: any): Promise<{
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
    getProfile(req: any): any;
}
