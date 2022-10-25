import { useRouter } from 'next/router';
import { useEffect } from 'react';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import WithAuthentication from '@components/WithAuthentication';
import Routes from '@lib/routes';
import CreateEditClientForm from '@components/CreateEditClientForm';
import useClient from '@lib/clients/useClient';

const EditClientPage = () => {
  const router = useRouter();
  const { data: client, isError } = useClient(router.query.clientId as string);

  useEffect(() => {
    if (isError) {
      void router.push(Routes.notFound);
    }
  }, [router, isError]);

  return client ? (
    <CreateEditClientForm client={client} />
  ) : (
    <FullScreenSpinner />
  );
};

export default WithAuthentication(EditClientPage);