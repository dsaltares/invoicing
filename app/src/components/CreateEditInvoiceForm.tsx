import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import { useRouter } from 'next/router';
import { type PropsWithChildren, useCallback, useMemo } from 'react';
import {
  type SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
} from 'react-hook-form';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import useCreateInvoice from '@lib/invoices/useCreateInvoice';
import Routes from '@lib/routes';
import type { Client } from '@server/clients/types';
import type { Invoice } from '@server/invoices/types';
import type { Company } from '@server/company/types';
import type { Product } from '@server/products/types';
import formatDate from '@lib/formatDate';
import FormCard from './FormCard';
import AutocompleteField from './Fields/AutocompleteField';
import TextField from './Fields/TextField';
import InvoiceTotalSection from './InvoiceTotalSection';
import SelectField from './Fields/SelectField';
import IconButton from './IconButton';

type InvoiceFormValues = {
  status: Invoice['status'];
  prefix: Invoice['prefix'];
  date: string;
  client: Invoice['client'];
  items: {
    product: Product;
    date: string;
    quantity: string;
  }[];
};

type CreateEditInvoiceFormProps = {
  company: Company;
  clients: Client[];
  products: Product[];
  numberByPrefix: { [prefix: string]: number };
};

const getInvoiceNumber = (
  numberByPrefix: { [prefix: string]: number },
  prefix: string
) => {
  const number = numberByPrefix[prefix] || 0;
  return number + 1;
};

const CreateEditInvoiceForm = ({
  company,
  products,
  clients,
  numberByPrefix,
}: CreateEditInvoiceFormProps) => {
  const router = useRouter();
  const handleSuccess = useCallback(
    () => router.push(Routes.invoices),
    [router]
  );
  const { mutate: createInvoice } = useCreateInvoice({
    onSuccess: handleSuccess,
  });
  const today = useMemo(() => format(startOfDay(new Date()), 'yyyy-MM-dd'), []);
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    mode: 'onBlur',
    defaultValues: {
      status: 'DRAFT',
      prefix: '',
      date: today,
      items: [],
    },
  });
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: 'items',
    rules: { minLength: 1 },
  });
  const [watchPrefix, watchDate, watchClient, watchItems] = watch([
    'prefix',
    'date',
    'client',
    'items',
  ]);
  const onSubmit: SubmitHandler<InvoiceFormValues> = useCallback(
    (values) =>
      createInvoice({
        ...values,
        company,
        clientId: values.client.id,
        // clientId: clients[0].id,
        date: new Date(values.date).toISOString(),
        items: values.items.map((item) => ({
          productId: item.product.id,
          quantity: parseInt(item.quantity, 10),
          date: new Date(item.date).toISOString(),
        })),
      }),
    [createInvoice, company]
  );

  return (
    <FormCard
      title="Invoice details"
      description="Add the details of your invoice below"
      onSubmit={handleSubmit(onSubmit)}
      submitButton={{
        label: 'Save draft',
        icon: faPlus,
      }}
      backHref={Routes.invoices}
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <Controller
            control={control}
            name="client"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <AutocompleteField<Client>
                id="invoice-client"
                placeholder="Client..."
                label="Select client"
                value={value}
                options={clients}
                optionToLabel={clientToLabel}
                optionToKey={clientToKey}
                onChange={onChange}
                required
                error={errors.client && 'Client is required'}
              />
            )}
          />
          <div className="flex items-end gap-2">
            <TextField
              id="invoice-prefix"
              placeholder="Prefix..."
              type="text"
              {...register('prefix')}
              label="Prefix"
            />
            <div className="flex justify-center bg-zinc-200 rounded-lg p-2 text-sm text-zinc-900 min-w-[54px]">
              {getInvoiceNumber(numberByPrefix, watchPrefix)}
            </div>
          </div>
          <TextField
            id="invoice-date"
            placeholder="Date..."
            type="date"
            {...register('date', { required: true })}
            label="Date"
            required
            min={today}
          />
          <div className="flex flex-col gap-2 text-zinc-900 text-sm">
            <span className="font-medium">Due date</span>
            <span className="font-bold py-2">
              {watchClient
                ? formatDate(
                    addDays(
                      new Date(Date.parse(watchDate)),
                      watchClient.paymentTerms
                    )
                  )
                : ''}
            </span>
          </div>
        </div>
        <LineItemsTable>
          <>
            {itemFields.map((item, index) => (
              <tr key={item.id}>
                <BodyCell>
                  <div className="min-w-[200px]">
                    <Controller
                      control={control}
                      name={`items.${index}.product`}
                      render={({ field: { value, onChange } }) => (
                        <SelectField
                          id={`${item.id}-product`}
                          value={value}
                          placeholder="Product..."
                          options={products}
                          optionToKey={(product) => product.id}
                          optionToLabel={(product) => product.name}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                </BodyCell>
                <BodyCell>
                  <TextField
                    id={`${item.id}-date`}
                    placeholder="Date..."
                    type="date"
                    {...register(`items.${index}.date`, { required: true })}
                    required
                    defaultValue={today}
                  />
                </BodyCell>
                <BodyCell>
                  <div className="w-[84px]">
                    <TextField
                      id={`${item.id}-quantity`}
                      placeholder="Quantity..."
                      type="number"
                      {...register(`items.${index}.quantity`, {
                        required: true,
                      })}
                      required
                      defaultValue="1"
                      endAdornment={item.product.unit}
                    />
                  </div>
                </BodyCell>
                <BodyCell>
                  {`${item.product.price} ${item.product.currency}`}
                </BodyCell>
                <BodyCell>{`${item.product.vat}%`}</BodyCell>
                <BodyCell>
                  {`${lineItemTotal(
                    item.product,
                    parseInt(watchItems[index].quantity, 10)
                  )} ${item.product.currency}`}
                </BodyCell>
                <BodyCell>
                  <IconButton
                    aria-label="Remove"
                    icon={faXmark}
                    color="secondary"
                    variant="borderless"
                    size="sm"
                    onClick={() => removeItem(index)}
                  />
                </BodyCell>
              </tr>
            ))}
          </>
          <tr>
            <BodyCell>
              <div className="min-w-[200px]">
                <SelectField
                  id="lineitem-add-product"
                  placeholder="Product..."
                  options={products}
                  optionToKey={(product) => product.id}
                  optionToLabel={(product) => product.name}
                  onChange={(product) => {
                    if (product) {
                      appendItem({ product, date: today, quantity: '1' });
                    }
                  }}
                />
              </div>
            </BodyCell>
          </tr>
        </LineItemsTable>
        <div className="grid grid-cols-2 gap-8">
          <div></div>
          <InvoiceTotalSection items={watchItems} />
        </div>
      </div>
    </FormCard>
  );
};

const LineItemsTable = ({ children }: PropsWithChildren) => (
  <div className="relative flex w-full h-full overflow-x-auto overflow-y-visible">
    <table className="w-full whitespace-nowrap text-left text-base text-zinc-900 border-separate border-spacing-y-2 px-1">
      <thead className="text-sm font-medium">
        <tr>
          <HeaderCell>Product</HeaderCell>
          <HeaderCell>Date</HeaderCell>
          <HeaderCell>Quantity</HeaderCell>
          <HeaderCell>Price</HeaderCell>
          <HeaderCell>VAT</HeaderCell>
          <HeaderCell>Total</HeaderCell>
          <HeaderCell></HeaderCell>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const HeaderCell = ({ children }: PropsWithChildren) => (
  <th scope="col" className="py-1 pr-1 pl-1 first:pl-0 last:pr-0 font-medium">
    {children}
  </th>
);

const BodyCell = ({ children }: PropsWithChildren) => (
  <td className="py-1 pr-1 pl-1 first:pl-0 last:pr-0">{children}</td>
);

const clientToLabel = (client: Client) => client.name;
const clientToKey = (client: Client) => client.id;
const lineItemTotal = (product: Product, quantity: number) =>
  product.includesVat
    ? product.price * quantity
    : product.price * quantity * (1 + product.vat / 100);

export default CreateEditInvoiceForm;