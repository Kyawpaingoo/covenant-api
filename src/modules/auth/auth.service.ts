import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma';
import { RegisterDto, LoginDto } from './dto';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, userAgent?: string, ipAddress?: string) {
    const { email, password, businessName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with associated profile in a transaction
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            businessName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate tokens and create session
    const tokens = await this.createSession(user.id, userAgent, ipAddress);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    };
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens and create session
    const tokens = await this.createSession(user.id, userAgent, ipAddress);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        profile: user.profile,
      },
    };
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find session by token
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: refreshToken },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Delete old session (token rotation)
    await this.prisma.session.delete({
      where: { id: session.id },
    });

    // Create new session with new tokens
    const tokens = await this.createSession(session.userId, userAgent, ipAddress);

    return {
      ...tokens,
      user: {
        id: session.user.id,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
        profile: session.user.profile,
      },
    };
  }

  async logout(refreshToken: string) {
    // Delete session by token
    await this.prisma.session.deleteMany({
      where: { sessionToken: refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    // Delete all sessions for user
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out from all devices' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      profile: user.profile,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  private async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // Calculate expiry (7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Create session in database
    await this.prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId,
        expires,
        userAgent,
        ipAddress,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: string): string {
    const user = { sub: userId, type: 'access' as const };
    return this.jwtService.sign(user, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId, type: 'refresh' as const, jti: uuidv4() };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
