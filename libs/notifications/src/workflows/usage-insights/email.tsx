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
} from '@react-email/components';
import { IUsageEmailData } from './types';

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
}) {
  const isPositive = change > 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';

  const formatNumber = (num: number) => Math.floor(num).toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div className="h-[88px] rounded-lg border border-gray-100 bg-gray-50/50 p-1">
      <Row className="flex items-start justify-between gap-2">
        <Column align="left" className="w-full">
          <Text className="mb-0 mt-0 min-h-[28px] text-xs font-medium leading-tight text-gray-600">{title}</Text>
        </Column>
        <Column align="right" className="w-full">
          <Text className={`whitespace-nowrap text-xs font-medium ${changeColor} mb-0 mt-0`}>
            {isPositive ? '↑' : '↓'} {Math.abs(Math.floor(change))}%
          </Text>
        </Column>
      </Row>
      <Row className="mt-[10px]">
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
        {Object.entries(channels).map(([channel, metrics]) => (
          <Column key={channel} className="p-2">
            <MetricCard title={channel} current={metrics.current} previous={metrics.previous} change={metrics.change} />
          </Column>
        ))}
      </Row>
    </Section>
  );
}

function InboxMetrics({ metrics }: { metrics: IUsageEmailData['inboxMetrics'] }) {
  return (
    <Section className="mt-6">
      <SectionHeader title="Inbox Activity" />
      <Row>
        <Column className="p-2">
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
        <Column className="p-2">
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
  return (
    <Section className="mt-6">
      <SectionHeader title="Workflow Performance" />
      <Row>
        {Object.entries(workflows).map(([name, metrics]) => (
          <Column key={name} className="p-2">
            <MetricCard title={name} current={metrics.current} previous={metrics.previous} change={metrics.change} />
          </Column>
        ))}
      </Row>
    </Section>
  );
}

export default function UsageInsightsEmail(props: IUsageEmailData) {
  return (
    <Html>
      <Head />
      <Preview>
        📊 Usage Insights for {props.organizationName} - {props.period.current}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto w-full">
            <Section>
              <Img
                src={`https://dashboard.novu.co/static/images/novu-colored-text.png`}
                width="119"
                height="37"
                alt="Novu"
                className="mx-auto my-[32px]"
              />
            </Section>

            <Section className="rounded-t-lg bg-[#000000] px-6 py-8">
              <Heading className="text-center text-2xl font-bold text-white">Novu Insights Report</Heading>
              <Text className="text-center text-sm text-indigo-100">{props.organizationName}</Text>
            </Section>

            <Container className="rounded-b-lg bg-white px-3 py-3 shadow-sm">
              <div className="mb-6 rounded-md border border-indigo-100/50 bg-indigo-50/50 p-3 text-center">
                <Text className="text-xs font-medium text-indigo-900">
                  Reporting Period: {props.period.current}
                  <span className="mx-2">•</span>
                  Compared to: {props.period.previous}
                </Text>
              </div>

              <Section className="mb-6">
                <div className="rounded-lg border-2 border-indigo-100 bg-indigo-50/30 p-3">
                  <MetricCard
                    title="Total Subscriber Notifications"
                    current={props.subscriberNotifications.current}
                    previous={props.subscriberNotifications.previous}
                    change={props.subscriberNotifications.change}
                  />
                </div>
              </Section>

              <ChannelBreakdown channels={props.channelBreakdown} />
              <InboxMetrics metrics={props.inboxMetrics} />
              <WorkflowStats workflows={props.workflowStats} />

              <Section className="mt-8 border-t border-gray-100 pt-6">
                <Text className="text-center text-xs text-gray-400">Generated with ❤️ by Novu</Text>
              </Section>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
