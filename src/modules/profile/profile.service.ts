import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    // Find profile by user ID (from JWT)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: user.profile.id,
      userId: user.id,
      email: user.email,
      businessName: user.profile.businessName,
      stripeAccountId: user.profile.stripeAccountId,
      branding: user.profile.branding,
      createdAt: user.profile.createdAt,
      updatedAt: user.profile.updatedAt,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id: user.profile.id },
      data: updateProfileDto,
    });

    return {
      id: updatedProfile.id,
      userId: user.id,
      email: user.email,
      businessName: updatedProfile.businessName,
      stripeAccountId: updatedProfile.stripeAccountId,
      branding: updatedProfile.branding,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt,
    };
  }

  async getProfileByProfileId(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.user.email,
      businessName: profile.businessName,
      stripeAccountId: profile.stripeAccountId,
      branding: profile.branding,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
