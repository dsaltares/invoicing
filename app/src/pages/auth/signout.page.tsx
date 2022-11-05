import Head from 'next/head';
import {
  faArrowLeft,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Card from '@components/Card';
import AppName from '@lib/appName';
import Button from '@components/Button';
import WithAuthentication from '@components/WithAuthentication';
import Routes from '@lib/routes';

const SignOutPage = () => {
  const router = useRouter();
  return (
    <Card>
      <Head>
        <title>{`Log in - ${AppName}`}</title>
      </Head>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-center gap-3">
          <FontAwesomeIcon
            className="text-4xl text-violet-800"
            icon={faRightFromBracket}
          />
          <h1 className="text-2xl font-bold text-center">Sign out</h1>
        </div>
        <p className="text-base">Are you sure you want to sign out?</p>
        <div className="flex w-full justify-between">
          <Button
            color="secondary"
            startIcon={faArrowLeft}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Button
            color="danger"
            onClick={() => signOut({ callbackUrl: Routes.home })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WithAuthentication(SignOutPage);