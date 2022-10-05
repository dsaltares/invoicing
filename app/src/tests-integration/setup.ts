import prisma from '@server/prisma';

beforeAll(async () =>
  Promise.all([
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.company.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.invoiceProduct.deleteMany(),
  ])
);