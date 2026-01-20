import { PrismaClient, ContractStatus, InvoiceStatus, EntityType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import 'dotenv/config';

// Initialize pg Pool with SSL for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create developer user with profile
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'developer@codecovenant.com',
      password: passwordHash,
      emailVerified: new Date(),
      profile: {
        create: {
          businessName: 'Code & Covenant Development',
          stripeAccountId: 'acct_demo_123',
          branding: {
            logoUrl: 'https://example.com/logo.png',
            primaryColor: '#6366f1',
            font: 'Inter',
          },
        },
      },
    },
    include: {
      profile: true,
    },
  });
  console.log(`✓ Created developer user: ${user.email}`);

  const profileId = user.profile!.id;

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        profileId,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        companyAddress: '123 Business Ave, Tech City, TC 12345',
        taxId: 'VAT-123456789',
      },
    }),
    prisma.client.create({
      data: {
        profileId,
        name: 'StartupXYZ Inc.',
        email: 'hello@startupxyz.io',
        companyAddress: '456 Innovation Blvd, Silicon Valley, CA 94000',
        taxId: 'EIN-987654321',
      },
    }),
    prisma.client.create({
      data: {
        profileId,
        name: 'Global Tech Solutions',
        email: 'projects@globaltech.com',
        companyAddress: '789 Enterprise Way, New York, NY 10001',
      },
    }),
  ]);
  console.log(`✓ Created ${clients.length} clients`);

  // Create contracts
  const contractContent = `# Website Development Agreement

## Project Scope

The Developer agrees to design, develop, and deploy a custom web application for the Client according to the specifications outlined in this agreement.

## Deliverables

1. **Frontend Development**
   - Modern React-based user interface
   - Responsive design for mobile and desktop
   - Accessibility compliance (WCAG 2.1)

2. **Backend Development**
   - RESTful API with NestJS
   - PostgreSQL database
   - Authentication and authorization

3. **Deployment**
   - Cloud hosting setup
   - CI/CD pipeline configuration
   - Documentation and training

## Timeline

The project will be completed within 12 weeks from the signing of this agreement.

## Payment Terms

- 30% upfront upon signing
- 40% upon completion of development
- 30% upon final delivery and approval
`;

  const contracts = await Promise.all([
    prisma.contract.create({
      data: {
        clientId: clients[0].id,
        title: 'Website Development Agreement',
        content: contractContent,
        status: ContractStatus.SIGNED,
        version: 2,
        shortLink: 'abc123def456',
      },
    }),
    prisma.contract.create({
      data: {
        clientId: clients[1].id,
        title: 'Mobile App Development Contract',
        content: contractContent.replace('Website', 'Mobile App'),
        status: ContractStatus.SENT,
        version: 1,
        shortLink: 'xyz789ghi012',
      },
    }),
    prisma.contract.create({
      data: {
        clientId: clients[2].id,
        title: 'API Integration Services',
        content: contractContent.replace('Website Development', 'API Integration'),
        status: ContractStatus.DRAFT,
        version: 1,
        shortLink: 'api456int789',
      },
    }),
  ]);
  console.log(`✓ Created ${contracts.length} contracts`);

  // Create signature for signed contract
  await prisma.signature.create({
    data: {
      contractId: contracts[0].id,
      signerName: 'John Smith',
      signerEmail: 'john.smith@acme.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  console.log('✓ Created contract signature');

  // Create invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-001',
        clientId: clients[0].id,
        contractId: contracts[0].id,
        status: InvoiceStatus.PAID,
        dueDate: new Date('2026-02-01'),
        currency: 'USD',
        taxRate: 10,
        subtotal: 5000,
        taxAmount: 500,
        total: 5500,
        stripePaymentIntentId: 'pi_demo_paid_123',
        items: {
          create: [
            {
              description: 'Frontend Development - Phase 1',
              quantity: 40,
              unitPrice: 100,
              total: 4000,
            },
            {
              description: 'UI/UX Design Consultation',
              quantity: 10,
              unitPrice: 100,
              total: 1000,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-002',
        clientId: clients[0].id,
        contractId: contracts[0].id,
        status: InvoiceStatus.OPEN,
        dueDate: new Date('2026-02-15'),
        currency: 'USD',
        taxRate: 10,
        subtotal: 6500,
        taxAmount: 650,
        total: 7150,
        items: {
          create: [
            {
              description: 'Backend API Development',
              quantity: 50,
              unitPrice: 100,
              total: 5000,
            },
            {
              description: 'Database Design & Setup',
              quantity: 15,
              unitPrice: 100,
              total: 1500,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-003',
        clientId: clients[1].id,
        status: InvoiceStatus.DRAFT,
        dueDate: new Date('2026-03-01'),
        currency: 'USD',
        taxRate: 8,
        subtotal: 3000,
        taxAmount: 240,
        total: 3240,
        items: {
          create: [
            {
              description: 'Mobile App Prototype',
              quantity: 30,
              unitPrice: 100,
              total: 3000,
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✓ Created ${invoices.length} invoices with line items`);

  // Create activity logs
  await Promise.all([
    prisma.activityLog.create({
      data: {
        entityType: EntityType.CONTRACT,
        entityId: contracts[0].id,
        event: 'SENT',
        metadata: { sentTo: 'contact@acme.com' },
      },
    }),
    prisma.activityLog.create({
      data: {
        entityType: EntityType.CONTRACT,
        entityId: contracts[0].id,
        event: 'VIEWED',
        metadata: { ipAddress: '192.168.1.100' },
      },
    }),
    prisma.activityLog.create({
      data: {
        entityType: EntityType.CONTRACT,
        entityId: contracts[0].id,
        event: 'SIGNED',
        metadata: {
          signerName: 'John Smith',
          signerEmail: 'john.smith@acme.com',
          ipAddress: '192.168.1.100',
        },
      },
    }),
    prisma.activityLog.create({
      data: {
        entityType: EntityType.INVOICE,
        entityId: invoices[0].id,
        event: 'CREATED',
        metadata: { invoiceNumber: 'INV-2026-001' },
      },
    }),
    prisma.activityLog.create({
      data: {
        entityType: EntityType.INVOICE,
        entityId: invoices[0].id,
        event: 'PAID',
        metadata: { stripePaymentIntentId: 'pi_demo_paid_123' },
      },
    }),
  ]);
  console.log('✓ Created activity logs');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📋 Test Credentials:');
  console.log('   Email: developer@codecovenant.com');
  console.log('   Password: password123\n');
  console.log('🔗 Public Contract Links:');
  console.log('   /portal/contract/abc123def456 (signed)');
  console.log('   /portal/contract/xyz789ghi012 (sent)');
  console.log('   /portal/contract/api456int789 (draft)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
