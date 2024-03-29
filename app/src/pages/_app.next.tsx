import '../styles/globals.css';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import type { AppProps as BaseAppProps } from 'next/app';
import type { Session } from 'next-auth';
import Head from 'next/head';
import Script from 'next/script';
import Providers from '@components/Providers';
import Layout from '@components/Layout';
import AppName from '@lib/appName';
import Routes from '@lib/routes';

config.autoAddCss = false;

type AppProps = BaseAppProps & {
  pageProps: BaseAppProps['pageProps'] & {
    session?: Session;
  };
};

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => (
  <Providers session={session}>
    <Layout>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <title>{AppName}</title>
        <meta name="description" content="The invoicing app for freelancers" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png"></link>
        <meta name="theme-color" content="#6B26D9" />
      </Head>
      <Component {...pageProps} />
    </Layout>
    <Script
      id="cookie-banner"
      src="https://cdn.websitepolicies.io/lib/cookieconsent/cookieconsent.min.js"
      defer
    />
    <Script
      id="cookie-banner-init"
      dangerouslySetInnerHTML={{
        __html: `window.addEventListener("load",function(){window.wpcc.init({"border":"thin","corners":"small","colors":{"popup":{"background":"#F5F3FF","text":"#000000","border":"#6D28D9"},"button":{"background":"#6D28D9","text":"#ffffff"}},"position":"bottom","content":{"href":"https://invoicing.saltares.com${Routes.cookiePolicy}","message":"This app uses cookies to ensure the best possible experience."}})});`,
      }}
    />
  </Providers>
);

export default App;
