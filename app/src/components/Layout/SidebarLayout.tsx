import { type PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar, { MobileSidebarOpenControls } from '@components/Sidebar';
import useDisclosure from '@lib/useDisclosure';

const SidebarLayout = ({ children }: PropsWithChildren) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);
  return (
    <div className="flex flex-row min-h-full w-full">
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <main className="flex flex-col min-h-full p-4 bg-violet-50 lg:p-12 main-content">
        <MobileSidebarOpenControls onOpenSidebar={onOpen} />
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
