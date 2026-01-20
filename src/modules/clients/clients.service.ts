import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProfileId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('Profile not found');
    }

    return user.profile.id;
  }

  async create(userId: string, createClientDto: CreateClientDto) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        profileId,
      },
    });
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.client.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contracts: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            dueDate: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    return client;
  }

  async update(
    userId: string,
    id: string,
    updateClientDto: UpdateClientDto,
  ) {
    const profileId = await this.getProfileId(userId);

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Client deleted successfully' };
  }
}
