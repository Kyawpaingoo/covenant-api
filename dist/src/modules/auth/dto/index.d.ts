export declare class RegisterDto {
    email: string;
    password: string;
    businessName?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}
