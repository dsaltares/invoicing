import { TRPCError } from '@trpc/server';
import omit from 'lodash.omit';
import { type Procedure, procedure } from '@server/trpc';
import prisma from '@server/prisma';
import { UpdateProductOutput, UpdateProductInput } from './types';
import mapProductEntity from './mapProductEntity';

export const updateProduct: Procedure<
  UpdateProductInput,
  UpdateProductOutput
> = async ({ ctx: { session }, input: { id, ...data } }) => {
  const existingProduct = await prisma.product.findFirst({
    where: { id, companyId: session?.companyId as string },
    include: {
      states: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!existingProduct) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'The product does not exist.',
    });
  }

  const stateData = {
    ...omit(existingProduct.states[0], 'id', 'createdAt'),
    ...data,
    productId: id,
  };
  const newState = await prisma.productState.create({ data: stateData });
  return mapProductEntity({
    ...existingProduct,
    states: [newState],
  });
};

export default procedure
  .input(UpdateProductInput)
  .output(UpdateProductOutput)
  .mutation(updateProduct);
