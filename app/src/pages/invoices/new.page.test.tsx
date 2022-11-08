import 'next';
import { setupServer } from 'msw/node';
import type { Session } from 'next-auth';
import { TRPCError } from '@trpc/server';

import userEvent from '@testing-library/user-event';
import {
  mockRouter,
  mockTrpcMutation,
  mockTrpcMutationError,
  mockTrpcQuery,
  render,
  screen,
  fireEvent,
  mockTrpcQueries,
  act,
  waitFor,
} from '@lib/testing';
import type { Product } from '@server/products/types';
import type { Company } from '@server/company/types';
import type { Client } from '@server/clients/types';
import type { Invoice } from '@server/invoices/types';
import Routes from '@lib/routes';
import NewInvoicePage from './new.page';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const companyId = 'company_1';
const userId = 'user_1';
const session: Session = {
  user: {},
  userId,
  companyId: companyId,
  expires: '',
};
const router = {
  pathname: Routes.createProduct,
};
const company: Company = {
  id: companyId,
  name: 'company_name',
  number: 'company_number',
  vatNumber: 'vat_number',
  email: 'invoicing@company.com',
  website: 'https://company.com',
  country: 'United Kingdom',
  address: 'Oxford Street',
  city: 'London',
  postCode: 'W1',
  iban: 'GB33BUKB20201555555555',
  userId,
  createdAt: new Date(),
};
const product: Product = {
  id: 'product_id',
  name: 'product_name',
  includesVat: false,
  price: 10,
  currency: 'GBP',
  vat: 15,
  unit: 'm',
  companyId,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const client: Client = {
  id: 'client_1',
  name: 'Client 1',
  number: '1',
  vatNumber: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@company.com',
  country: 'client_country',
  address: 'client_address',
  postCode: 'client_post_code',
  city: 'client_city',
  paymentTerms: 7,
  companyId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NewInvoicePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('tells the user they need to complete company details when the company is incomplete', async () => {
    const incompleteCompany: Company = {
      id: companyId,
      name: '',
      number: '',
      vatNumber: '',
      email: '',
      website: '',
      country: '',
      address: '',
      city: '',
      postCode: '',
      iban: '',
      userId: 'user_id',
      createdAt: new Date(),
    };
    server.resetHandlers(
      mockTrpcQueries([
        { name: 'getClients', result: [] },
        { name: 'getProducts', result: [] },
        { name: 'getCompany', result: incompleteCompany },
        { name: 'getInvoices', result: [] },
      ])
    );

    render(<NewInvoicePage />, { session, router });

    await fireEvent.click(
      await screen.findByRole('link', { name: 'Add company details' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith(
      Routes.company,
      expect.anything(),
      expect.anything()
    );
  });

  it('tells they user they need to create a client if there are no clients', async () => {
    server.resetHandlers(
      mockTrpcQueries([
        { name: 'getClients', result: [] },
        { name: 'getProducts', result: [product] },
        { name: 'getCompany', result: company },
        { name: 'getInvoices', result: [] },
      ])
    );

    render(<NewInvoicePage />, { session, router });

    await fireEvent.click(
      await screen.findByRole('link', { name: 'Add clients' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith(
      Routes.clients,
      expect.anything(),
      expect.anything()
    );
  });

  it('tells they user they need to create a product if there are no products', async () => {
    server.resetHandlers(
      mockTrpcQueries([
        { name: 'getClients', result: [client] },
        { name: 'getProducts', result: [] },
        { name: 'getCompany', result: company },
        { name: 'getInvoices', result: [] },
      ])
    );

    render(<NewInvoicePage />, { session, router });

    await fireEvent.click(
      await screen.findByRole('link', { name: 'Add products' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith(
      Routes.products,
      expect.anything(),
      expect.anything()
    );
  });

  it('allows the user to create an invoice', async () => {
    server.resetHandlers(
      mockTrpcQueries([
        { name: 'getClients', result: [client] },
        { name: 'getProducts', result: [product] },
        { name: 'getCompany', result: company },
        { name: 'getInvoices', result: [] },
      ])
    );

    render(<NewInvoicePage />, { session, router });

    await userEvent.type(
      await screen.findByPlaceholderText('Client...'),
      `${client.name}{enter}`
    );
    await fireEvent.click(
      await screen.findByRole('button', { name: 'Product...' })
    );
    await act(async () => {
      await fireEvent.click(await screen.findByText(product.name));
    });

    const invoice: Invoice = {
      id: 'invoice_1',
      status: 'DRAFT',
      prefix: '',
      company,
      client,
      date: new Date().toISOString(),
      items: [
        {
          id: 'item_1',
          invoiceId: 'invoice_1',
          product,
          quantity: 1,
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    server.resetHandlers(
      mockTrpcMutation('createInvoice', invoice),
      mockTrpcQuery('getInvoices', [invoice])
    );

    await act(async () => {
      await fireEvent.click(
        await screen.findByRole('button', { name: 'Save draft' })
      );
    });

    await waitFor(() => {
      screen.getByText('Invoice created');
      expect(mockRouter.push).toHaveBeenCalledWith(Routes.invoices);
    });
  });

  it('shows a message when failing to create an invoice', async () => {
    server.resetHandlers(
      mockTrpcQueries([
        { name: 'getClients', result: [client] },
        { name: 'getProducts', result: [product] },
        { name: 'getCompany', result: company },
        { name: 'getInvoices', result: [] },
      ])
    );

    render(<NewInvoicePage />, { session, router });

    await userEvent.type(
      await screen.findByPlaceholderText('Client...'),
      `${client.name}{enter}`
    );
    await fireEvent.click(
      await screen.findByRole('button', { name: 'Product...' })
    );
    await act(async () => {
      await fireEvent.click(await screen.findByText(product.name));
    });

    server.resetHandlers(
      mockTrpcMutationError(
        'createInvoice',
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      ),
      mockTrpcQuery('getInvoices', [])
    );

    await act(async () => {
      await fireEvent.click(
        await screen.findByRole('button', { name: 'Save draft' })
      );
    });

    await screen.findByText('Failed to create invoice');
  });
});