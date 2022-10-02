import EmptyContent from '@components/EmptyContent';
import Layout from '@components/Layout';
import WithAuthentication from '@components/WithAuthentication';

const ProductsPage = () => (
  <Layout>
    <EmptyContent
      message="You don't have any products yet"
      actionLabel="Add products"
      onClick={() => {}}
    />
  </Layout>
);

export default WithAuthentication(ProductsPage);
