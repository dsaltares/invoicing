import 'next';
import { setupServer } from 'msw/node';
import type { Session } from 'next-auth';
import { TRPCError } from '@trpc/server';
import {
  mockRouter,
  mockTrpcMutation,
  mockTrpcMutationError,
  mockTrpcQuery,
  render,
  screen,
  fireEvent,
} from '@lib/testing';
import type { Client } from '@server/clients/types';
import Routes from '@lib/routes';
import NewClientPage from './new.page';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const now = new Date().toISOString();
const companyId = 'company_1';
const session: Session = {
  user: {},
  userId: 'user_1',
  companyId: companyId,
  expires: '',
};
const router = {
  pathname: Routes.createClient,
};
const client: Client = {
  id: 'client_id',
  name: 'client_name',
  number: 'client_number',
  vatNumber: 'client_vat_number',
  contactName: 'client_contact_name',
  email: 'contact@company.com',
  country: 'client_country',
  address: 'client_address',
  postCode: 'client_post_code',
  city: 'client_city',
  paymentTerms: 30,
  companyId,
  createdAt: now,
  updatedAt: now,
};

describe('NewClientPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('allows the user to create a new client', async () => {
    render(<NewClientPage />, { session, router });

    await fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: client.name! },
    });
    await fireEvent.change(screen.getByLabelText('Number'), {
      target: { value: client.number! },
    });
    await fireEvent.change(screen.getByLabelText('VAT number'), {
      target: { value: client.vatNumber! },
    });
    await fireEvent.change(screen.getByLabelText('Contact name'), {
      target: { value: client.contactName! },
    });
    await fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: client.email! },
    });
    await fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: client.country! },
    });
    await fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: client.address! },
    });
    await fireEvent.change(screen.getByLabelText('Post code'), {
      target: { value: client.postCode! },
    });
    await fireEvent.change(screen.getByLabelText('City'), {
      target: { value: client.city! },
    });
    await fireEvent.change(screen.getByLabelText('Payment terms'), {
      target: { value: client.paymentTerms.toString() },
    });

    server.resetHandlers(
      mockTrpcMutation('createClient', client),
      mockTrpcQuery('getClients', [client])
    );

    await fireEvent.click(screen.getByRole('button', { name: 'Add client' }));

    await screen.findByText('Successfully created client!');
    expect(mockRouter.push).toHaveBeenCalledWith(Routes.clients);
  });

  it('forces the user to enter a name', async () => {
    render(<NewClientPage />, { session, router });

    await fireEvent.click(screen.getByRole('button', { name: 'Add client' }));

    await screen.findByText('Client name is required');
  });

  it('shows error message when failing to create a client', async () => {
    render(<NewClientPage />, { session, router });

    await fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: client.name! },
    });
    await fireEvent.change(screen.getByLabelText('Number'), {
      target: { value: client.number! },
    });

    server.resetHandlers(
      mockTrpcMutationError(
        'createClient',
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      )
    );

    await fireEvent.click(screen.getByRole('button', { name: 'Add client' }));

    await screen.findByText('Failed to create client');
  });
});
