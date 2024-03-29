import { Listbox, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import cn from 'classnames';
import useDropdownAnchor from '@lib/useDropdownAnchor';
import Label from './Label';
import Error from './Error';
import Tip from './Tip';

type SelectFieldProps<Option> = {
  value?: Option;
  options: Option[];
  optionToLabel: (option: Option) => string;
  optionToKey: (option: Option) => string;
  onChange: (option?: Option) => void;
  label?: string;
  error?: string;
  tip?: string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  required?: boolean;
};

function SelectField<Option>({
  id,
  label,
  error,
  tip,
  disabled,
  value,
  options,
  onChange,
  optionToLabel,
  optionToKey,
  placeholder,
  required = false,
}: SelectFieldProps<Option>) {
  const { anchorRef, top, width } = useDropdownAnchor();
  const showError = !!error && !disabled;
  const showTip = !showError && !!tip;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2">
          <Label htmlFor={id} error={showError} disabled={disabled}>
            {label}
          </Label>
        </div>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div ref={anchorRef} className="relative">
            <div
              className={cn('border text-sm rounded-lg', {
                'bg-zinc-50 cursor-default': !disabled,
                'bg-zinc-100 text-zinc-400 cursor-not-allowed': !!disabled,
                'border-zinc-300': (!error || !!disabled) && !open,
                'border-violet-500': open,
                'border-red-600': !!error && !disabled,
                'text-zinc-900': !error && !disabled && !!value,
                'text-zinc-400': !error && !disabled && !value,
                'text-red-600': !!error && !disabled,
                "after:content-['*'] after:ml-0.5 after:text-red-500":
                  !!required,
              })}
            >
              <Listbox.Button className="'box-border relative w-full text-left text-sm p-2 focus-ring'">
                <span className={cn('block truncate')}>
                  {value ? optionToLabel(value) : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FontAwesomeIcon
                    className="h-5 w-5 text-zinc-800"
                    icon={open ? faCaretUp : faCaretDown}
                  />
                </span>
              </Listbox.Button>
            </div>
            <Transition
              as={'div'}
              className="relative z-50"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className="fixed overflow:visible max-h-60 mt-1 overflow-auto rounded-md bg-white py-1 text-base shadow-xl border border-violet-500 focus-ring"
                style={{ top, width }}
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={optionToKey(option)}
                    className={({ active, selected }) =>
                      cn('relative cursor-default select-none py-2 px-3', {
                        'bg-violet-50': selected && !active,
                        'bg-violet-100': active,
                        'bg-white': !active && !selected,
                      })
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn('block truncate text-sm', {
                            'font-medium text-violet-800': selected,
                            'font-normal': !selected,
                          })}
                        >
                          {optionToLabel(option)}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      {showTip && (
        <div className="mt-1">
          <Tip>{tip}</Tip>
        </div>
      )}
      {showError && (
        <div className="mt-1">
          <Error>{error}</Error>
        </div>
      )}
    </div>
  );
}

export default SelectField;
