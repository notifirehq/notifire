import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
  Row,
  Column,
  Link,
  Hr,
} from '@react-email/components';
import { IUsageEmailData } from './types';

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function MetricCard({
  title,
  current,
  previous,
  change,
}: {
  title: string;
  current: number;
  previous: number;
  change: number;
  padding?: string;
}) {
  const isPositive = change > 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';

  const formatNumber = (num: number) => Math.floor(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const formattedChange = Math.abs(Math.floor(change));

  return (
    <div className={`h-[75px] rounded-lg border border-gray-100 bg-gray-50/50 p-3`}>
      <Row className="flex items-start justify-between gap-2">
        <Column align="left" className="w-full">
          <Text className="mb-0 mt-0 min-h-[28px] text-xs font-medium capitalize leading-tight text-gray-600">
            {title}
          </Text>
        </Column>
        <Column align="right" valign="top" className="w-full">
          {formattedChange !== 0 ? (
            <Text className={`whitespace-nowrap text-[10px] font-medium ${changeColor} m-0 leading-[12px]`}>
              {isPositive ? '↑' : '↓'} {formattedChange}%
            </Text>
          ) : null}
        </Column>
      </Row>
      <Row>
        <Column align="left">
          <Text className="mb-0 mt-0 text-lg font-bold leading-none text-gray-900">{formatNumber(current)}</Text>
          <Text className="mb-0 mt-0.5 text-[10px] leading-none text-gray-500">Previous: {formatNumber(previous)}</Text>
        </Column>
      </Row>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <Heading className="text-base font-semibold text-gray-800">{title}</Heading>
    </div>
  );
}

function ChannelBreakdown({ channels }: { channels: IUsageEmailData['channelBreakdown'] }) {
  return (
    <Section className="mt-6">
      <SectionHeader title="Channel Breakdown" />
      <Row>
        <Column className="p-2 pl-0">
          <MetricCard
            title="Email"
            current={channels.email.current}
            previous={channels.email.previous}
            change={channels.email.change}
          />
        </Column>
        <Column className="p-2">
          <MetricCard
            title="Inbox"
            current={channels.in_app.current}
            previous={channels.in_app.previous}
            change={channels.in_app.change}
          />
        </Column>
        <Column className="p-2 pr-0">
          <MetricCard
            title="Push"
            current={channels.push.current}
            previous={channels.push.previous}
            change={channels.push.change}
          />
        </Column>
      </Row>
    </Section>
  );
}

function InboxMetrics({ metrics }: { metrics: IUsageEmailData['inboxMetrics'] }) {
  if (
    !metrics.markNotification.current &&
    !metrics.markNotification.previous &&
    !metrics.sessionInitialized.current &&
    !metrics.sessionInitialized.previous &&
    !metrics.updatePreferences.previous &&
    !metrics.updatePreferences.current
  ) {
    return null;
  }

  return (
    <Section className="mt-6">
      <SectionHeader title="Inbox Activity" />
      <Row>
        <Column className="p-2 pl-0">
          <MetricCard
            title="Sessions"
            current={metrics.sessionInitialized.current}
            previous={metrics.sessionInitialized.previous}
            change={metrics.sessionInitialized.change}
          />
        </Column>
        <Column className="p-2">
          <MetricCard
            title="Preference Updates"
            current={metrics.updatePreferences.current}
            previous={metrics.updatePreferences.previous}
            change={metrics.updatePreferences.change}
          />
        </Column>
        <Column className="p-2 pr-0">
          <MetricCard
            title="Notifications Marked"
            current={metrics.markNotification.current}
            previous={metrics.markNotification.previous}
            change={metrics.markNotification.change}
          />
        </Column>
      </Row>
    </Section>
  );
}

function WorkflowStats({ workflows }: { workflows: IUsageEmailData['workflowStats'] }) {
  const topWorkflows = Object.entries(workflows)
    ?.sort((a, b) => b[1].current - a[1].current)
    .slice(0, 6);

  return (
    <Section className="mt-6">
      <SectionHeader title="Top Workflow Activity" />
      <div className="rounded-lg border border-gray-100">
        {topWorkflows?.map(([name, metrics], index) => {
          const isPositive = metrics.change > 0;
          const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
          const isLast = index === topWorkflows.length - 1;

          return (
            <Row
              key={index}
              className={`flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-2 ${
                !isLast ? 'mb-2' : ''
              }`}
            >
              <Column align="left" className="w-full">
                <Text className="mb-0.5 mt-0 text-sm font-medium text-gray-900">{name}</Text>
                <Text className="mb-0 mt-0 text-xs text-gray-500">
                  <b>{Math.floor(metrics.current).toLocaleString()}</b> notifications sent vs{' '}
                  <b>{Math.floor(metrics.previous).toLocaleString()}</b>
                </Text>
              </Column>
              <Column align="right">
                <Text className={`mb-0 mt-0 whitespace-nowrap text-sm font-medium ${changeColor}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(Math.floor(metrics.change))}%
                </Text>
              </Column>
            </Row>
          );
        })}
      </div>
    </Section>
  );
}

interface IMarketingConfig {
  title: string;
  links: {
    text: string;
    href: string;
    emoji: string;
  }[];
  cta: {
    text: string;
    buttonText: string;
    buttonUrl: string;
  } | null;
}

function MarketingSection({ config }: { config: IMarketingConfig }) {
  return (
    <Section className="mt-8">
      <Hr className="mb-6 border-t border-gray-200" />
      <div>
        <Heading className="text-base font-semibold text-gray-900">{config.title}</Heading>
        <div className="flex flex-col space-y-3">
          {config.links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-center rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-gray-700 hover:underline"
            >
              <span className="mr-2">{link.emoji}</span>
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {config.cta ? (
        <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 text-center">
          <Text className="mb-2 text-sm font-medium text-indigo-900">{config.cta.text}</Text>
          <Link
            href={config.cta.buttonUrl}
            className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:underline"
          >
            {config.cta.buttonText}
          </Link>
        </div>
      ) : null}
    </Section>
  );
}

export default function UsageInsightsEmail(props: IUsageEmailData & { marketingConfig: IMarketingConfig }) {
  return (
    <Html className="bg-gray-50 font-sans">
      <Head />
      <Preview>
        📊 Usage Insights for {props.organizationName} - {formatDate(props.period.current)}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 pt-10 font-sans">
          <Img
            src={`https://dashboard.novu.co/static/images/novu-colored-text.png`}
            width="119"
            height="37"
            alt="Novu Logo"
            className="mx-auto mb-10 mt-10"
          />
          <Container className="mx-auto w-full max-w-[700px]">
            <Section className="rounded-t-lg bg-gray-900 px-6 py-8">
              <Heading className="text-center text-2xl font-bold text-white">Usage Insights Report</Heading>
              <Text className="text-center text-sm text-indigo-100">{props.organizationName}</Text>
            </Section>

            <div className="rounded-b-lg bg-white px-3 py-3 shadow-sm">
              <div className="mb-6 rounded-md border border-indigo-100/50 bg-indigo-50/50 p-2 text-center">
                <Text className="text-xs font-medium text-indigo-900">
                  Reporting Period: {formatDate(props.period.current)}
                  <span className="mx-2">•</span>
                  Compared to: {formatDate(props.period.previous)}
                </Text>
              </div>

              <Section className="mb-6">
                <div className="rounded-lg border-2 border-indigo-100 bg-indigo-50/30">
                  <MetricCard
                    title="Total Notification Triggers"
                    current={props.subscriberNotifications.current}
                    previous={props.subscriberNotifications.previous}
                    change={props.subscriberNotifications.change}
                  />
                </div>
              </Section>

              <ChannelBreakdown channels={props.channelBreakdown} />
              <InboxMetrics metrics={props.inboxMetrics} />
              <WorkflowStats workflows={props.workflowStats} />

              <MarketingSection config={props.marketingConfig} />

              <Section className="mt-6 border-t border-gray-100 pt-6">
                <Text className="text-center text-xs text-gray-400">Generated with ❤️ by Novu</Text>
              </Section>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
