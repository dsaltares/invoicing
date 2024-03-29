import {
  faChevronDown,
  faChevronUp,
  faCookie,
  faGavel,
  faLock,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import Link from 'next/link';
import Routes from '@lib/routes';
import { getFullName } from '@lib/userName';
import Avatar from '@components/Avatar';
import ConfirmationDialog from '@components/ConfirmationDialog';
import useDisclosure from '@lib/useDisclosure';

const UserMenu = () => {
  const { data } = useSession();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const Items = [
    {
      icon: faLock,
      label: 'Privacy policy',
      href: Routes.privacyPolicy,
    },
    {
      icon: faGavel,
      label: 'Terms & conditions',
      href: Routes.termsAndConditions,
    },
    {
      icon: faCookie,
      label: 'Cookie policy',
      href: Routes.cookiePolicy,
    },
    {
      icon: faRightFromBracket,
      label: 'Sign out',
      onClick: onOpen,
    },
  ];

  if (!data?.user) {
    return null;
  }

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="flex w-full items-center justify-between px-4 py-2 rounded-xl text-white text-base focus-ring">
                <div className="flex items-center gap-2">
                  <Avatar user={data.user!} />
                  <span>{getFullName(data.user!)}</span>
                </div>
                <FontAwesomeIcon
                  className="text-xs w-3 h-3"
                  icon={open ? faChevronUp : faChevronDown}
                />
              </Menu.Button>
            </div>
            <Transition
              as="div"
              className="relative z-10"
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="w-full absolute bottom-[60px] rounded-md bg-white py-2 shadow-xl border border-zinc-300 focus-ring">
                {Items.map(({ icon, label, href, onClick }) => (
                  <Menu.Item key={label}>
                    {({ active }) => {
                      const content = (
                        <>
                          <FontAwesomeIcon
                            className={cn('w-4 h-4', {
                              'text-zinc-500': !active,
                            })}
                            icon={icon}
                          />
                          {label}
                        </>
                      );
                      const wrapperClassName = cn(
                        'flex items-center w-full gap-2 py-2 px-3 text-base',
                        {
                          'bg-violet-50 text-violet-800': active,
                          'text-zinc-900': !active,
                        }
                      );
                      const wrapped = href ? (
                        <Link href={href} className={wrapperClassName}>
                          {content}
                        </Link>
                      ) : (
                        <button className={wrapperClassName} onClick={onClick}>
                          {content}
                        </button>
                      );
                      return <div>{wrapped}</div>;
                    }}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => signOut()}
        title="Sign out of Beet Bill"
        description="Are you sure you want to sign out?"
        confirm={{ label: 'Sign out' }}
        cancel={{ label: 'Cancel' }}
      />
    </>
  );
};

export default UserMenu;
