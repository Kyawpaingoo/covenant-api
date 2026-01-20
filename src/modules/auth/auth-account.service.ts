import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

export interface OAuthAccountInput {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface OAuthUserProfile {
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

@Injectable()
export class AuthAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Links an OAuth account to an existing or new user.
   * If a user with the given email already exists, the account is linked to that user.
   * Otherwise, a new user is created.
   */
  async linkOrCreateAccount(
    profile: OAuthUserProfile,
    accountInput: Omit<OAuthAccountInput, 'userId'>,
  ) {
    const { email, name, image, emailVerified } = profile;

    // Check if an account with this provider already exists
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: accountInput.provider,
          providerAccountId: accountInput.providerAccountId,
        },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (existingAccount) {
      // Update tokens if needed
      await this.prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          refresh_token: accountInput.refresh_token,
          access_token: accountInput.access_token,
          expires_at: accountInput.expires_at,
        },
      });

      return existingAccount.user;
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      // Link account to existing user
      await this.prisma.account.create({
        data: {
          ...accountInput,
          userId: existingUser.id,
        },
      });

      // Update user image if not set
      if (!existingUser.image && image) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { image },
        });
      }

      return existingUser;
    }

    // Create new user with account and profile
    const newUser = await this.prisma.user.create({
      data: {
        email,
        image,
        emailVerified: emailVerified ? new Date() : null,
        accounts: {
          create: accountInput,
        },
        profile: {
          create: {
            businessName: name,
          },
        },
      },
      include: {
        profile: true,
        accounts: true,
      },
    });

    return newUser;
  }

  /**
   * Get all linked accounts for a user
   */
  async getUserAccounts(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        type: true,
        // Exclude sensitive tokens
      },
    });
  }

  /**
   * Unlink an OAuth account from a user
   */
  async unlinkAccount(userId: string, provider: string) {
    // Ensure user has a password or another linked account before unlinking
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const hasPassword = !!user.password;
    const otherAccounts = user.accounts.filter((a) => a.provider !== provider);

    if (!hasPassword && otherAccounts.length === 0) {
      throw new Error(
        'Cannot unlink the only authentication method. Set a password first.',
      );
    }

    await this.prisma.account.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    return { message: `${provider} account unlinked successfully` };
  }
}
