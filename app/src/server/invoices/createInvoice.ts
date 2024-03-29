import { TRPCError } from '@trpc/server';
import { InvoiceStatus } from '@prisma/client';
import { type Procedure, procedure } from '@server/trpc';
import prisma from '@server/prisma';
import type { ArrayElement } from '@lib/utilityTypes';
import { CreateInvoiceOutput, CreateInvoiceInput } from './types';
import mapInvoiceEntity from './mapInvoiceEntity';
import { getLastInvoiceNumber } from './utils';

export const createInvoice: Procedure<
  CreateInvoiceInput,
  CreateInvoiceOutput
> = async ({
  ctx: { session },
  input: { clientId, status, prefix, date, message, items },
}) => {
  const companyId = session?.companyId as string;
  const [client, company] = await Promise.all([
    prisma.client.findFirst({
      where: {
        id: clientId,
        deletedAt: null,
      },
      include: {
        states: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.company.findFirst({
      where: {
        id: companyId,
      },
      include: {
        states: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  if (!client) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'The client does not exist.',
    });
  }
  if (!company) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'The company does not exist.',
    });
  }

  const invoice = await prisma.invoice.create({
    data: {
      status,
      prefix,
      number:
        status !== InvoiceStatus.DRAFT
          ? (await getLastInvoiceNumber({ companyId, prefix })) + 1
          : null,
      date,
      message,
      companyStateId: company.states[0].id,
      clientStateId: client.states[0].id,
      items: {
        createMany: {
          data: await buildItemsData(items),
        },
      },
    },
    include: {
      companyState: {
        include: {
          company: true,
        },
      },
      clientState: {
        include: {
          client: true,
        },
      },
      items: {
        include: {
          productState: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  return mapInvoiceEntity(invoice);
};

const buildItemsData = async (items: CreateInvoiceInput['items'] = []) => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map(({ productId }) => productId) },
    },
    include: {
      states: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const productsById = products.reduce(
    (acc, product) => ({
      ...acc,
      [product.id]: product,
    }),
    {} as Record<string, ArrayElement<typeof products>>
  );

  return items.map(({ productId, quantity, date }, index) => {
    const product = productsById[productId];
    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Some products do not exist.',
      });
    }

    return {
      productStateId: product.states[0].id,
      quantity,
      date,
      order: index,
    };
  });
};

export default procedure
  .input(CreateInvoiceInput)
  .output(CreateInvoiceOutput)
  .mutation(createInvoice);
