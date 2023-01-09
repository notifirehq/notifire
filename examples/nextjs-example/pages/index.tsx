import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '../styles/Home.module.css';
import { IMessage, NotificationBell, NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';

const inter = Inter({ subsets: ['latin'] });

interface HomeProps {
  appID: string;
  subscriberID: string;
}

export default function Home({ appID, subscriberID }: HomeProps) {
  const onNotificationClick = (message: IMessage) => {
    if (message?.cta?.data?.url) {
      window.location.href = message.cta.data.url;
    }
  };

  const sayHello = () => fetch('/api/hello');

  return (
    <>
      <Head>
        <title>Novu | NextJS Example</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <div className={styles.brands}>
            <Image src="/novu.svg" alt="Novu Logo" width={100} height={32} />
            <span>❤️</span>
            <Image className={styles.logo} src="/next.svg" alt="Next.js Logo" width={100} height={24} />
          </div>
          <div>
            <NovuProvider subscriberId={subscriberID} applicationIdentifier={appID}>
              <PopoverNotificationCenter onNotificationClick={onNotificationClick} colorScheme="light">
                {({ unseenCount }) => <NotificationBell unseenCount={unseenCount} />}
              </PopoverNotificationCenter>
            </NovuProvider>
          </div>
        </div>

        <div className={styles.center}>
          <p>A slight push, a grand beginning.</p>
          <button onClick={sayHello}>Trigger a new notification! 👋</button>
        </div>

        <div className={styles.grid}>
          <a href="https://docs.novu.co/" className={styles.card} target="_blank" rel="noopener noreferrer">
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Find in-depth information about Novu features and&nbsp;API.</p>
          </a>

          <a
            href="https://docs.novu.co/overview/docker-deploy"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Get started with self-hosted Novu.</p>
          </a>

          <a
            href="https://discord.com/invite/WCaaK8nwZ7"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Community <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Say hello to the Novu Discord community.</p>
          </a>

          <a
            href="https://docs.novu.co/community/faq"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              FAQs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Find answers to common questions.</p>
          </a>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps(): Promise<{ props: HomeProps }> {
  return {
    props: {
      appID: process.env.NOVU_APP_ID ?? '<YOUR_APP_ID>',
      subscriberID: process.env.NOVU_SUBSCRIBER_ID ?? '<YOUR_SUBSCRIBER_ID>',
    },
  };
}
