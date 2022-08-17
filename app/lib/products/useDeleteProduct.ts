import api from '@lib/api';
import useMutation from '@lib/useMutation';
import type {
  DeleteProductsInput,
  GetProductsOutput,
} from '@server/products/types';
import QueryKeys from './queryKeys';

const useDeleteProduct = () =>
  useMutation<DeleteProductsInput, GetProductsOutput>({
    mutationFn: api.deleteProduct.mutate,
    cacheKey: QueryKeys.products,
    cacheUpdater: (products, input) => {
      const productIndex = products.findIndex(({ id }) => id === input.id);
      if (productIndex !== -1) {
        products.splice(productIndex, 1);
      }
    },
  });

export default useDeleteProduct;