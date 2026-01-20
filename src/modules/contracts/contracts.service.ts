import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ActivityService } from '../activity/activity.service';
import { CreateContractDto, UpdateContractDto, SignContractDto } from './dto';
import { ContractStatus, EntityType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private generateShortLink(): string {
    return uuidv4().split('-')[0] + uuidv4().split('-')[1];
  }

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

  async create(userId: string, createContractDto: CreateContractDto) {
    const profileId = await this.getProfileId(userId);

    // Verify client belongs to the profile
    const client = await this.prisma.client.findFirst({
      where: {
        id: createContractDto.clientId,
        profileId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const contract = await this.prisma.contract.create({
      data: {
        ...createContractDto,
        shortLink: this.generateShortLink(),
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return contract;
  }

  async findAll(userId: string) {
    const profileId = await this.getProfileId(userId);

    return this.prisma.contract.findMany({
      where: {
        client: {
          profileId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            signatures: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        signatures: true,
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  async update(
    userId: string,
    id: string,
    updateContractDto: UpdateContractDto,
  ) {
    const profileId = await this.getProfileId(userId);

    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    // Increment version when content changes
    const shouldIncrementVersion =
      updateContractDto.content &&
      updateContractDto.content !== contract.content;

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        ...updateContractDto,
        version: shouldIncrementVersion
          ? { increment: 1 }
          : contract.version,
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log status change if applicable
    if (
      updateContractDto.status &&
      updateContractDto.status !== contract.status
    ) {
      await this.activityService.log({
        entityType: EntityType.CONTRACT,
        entityId: id,
        event: updateContractDto.status,
        metadata: { previousStatus: contract.status },
      });
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const profileId = await this.getProfileId(userId);

    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.client.profileId !== profileId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.contract.delete({ where: { id } });

    return { message: 'Contract deleted successfully' };
  }

  // Public portal endpoints (no auth required)
  async findBySlug(slug: string, ipAddress?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { shortLink: slug },
      include: {
        client: {
          include: {
            profile: {
              select: {
                businessName: true,
                branding: true,
              },
            },
          },
        },
        signatures: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Log view if not already signed
    if (contract.status !== ContractStatus.SIGNED) {
      // Update status to VIEWED if still SENT
      if (contract.status === ContractStatus.SENT) {
        await this.prisma.contract.update({
          where: { id: contract.id },
          data: { status: ContractStatus.VIEWED },
        });
      }

      await this.activityService.log({
        entityType: EntityType.CONTRACT,
        entityId: contract.id,
        event: 'VIEWED',
        metadata: { ipAddress },
      });
    }

    return contract;
  }

  async signContract(slug: string, signDto: SignContractDto, ipAddress: string, userAgent?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { shortLink: slug },
      include: { signatures: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status === ContractStatus.VOID) {
      throw new BadRequestException('This contract has been voided');
    }

    if (contract.status === ContractStatus.SIGNED) {
      throw new BadRequestException('This contract has already been signed');
    }

    // Create signature and update contract status
    const [signature] = await this.prisma.$transaction([
      this.prisma.signature.create({
        data: {
          contractId: contract.id,
          signerName: signDto.signerName,
          signerEmail: signDto.signerEmail,
          ipAddress,
          userAgent,
        },
      }),
      this.prisma.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.SIGNED },
      }),
    ]);

    // Log signature event
    await this.activityService.log({
      entityType: EntityType.CONTRACT,
      entityId: contract.id,
      event: 'SIGNED',
      metadata: {
        signerName: signDto.signerName,
        signerEmail: signDto.signerEmail,
        ipAddress,
        userAgent,
        signedAt: new Date().toISOString(),
      },
    });

    return {
      message: 'Contract signed successfully',
      signature: {
        id: signature.id,
        signerName: signature.signerName,
        signedAt: signature.signedAt,
      },
    };
  }
}
