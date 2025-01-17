import { AddSubscriberIllustration } from '@/components/icons/add-subscriber-illustration';
import { RiBookMarkedLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { LinkButton } from './primitives/button-link';

export const SubscriberListEmpty = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <AddSubscriberIllustration />
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-foreground-900 block font-medium">No subscribers yet</span>
        <p className="text-foreground-400 max-w-[60ch] text-sm">
          A Subscriber is a unique entity for receiving notifications. Add them ahead of time or migrate them
          dynamically when sending notifications.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Link to={'https://docs.novu.co/concepts/subscribers#migration-optional'} target="_blank">
          <LinkButton variant="gray" trailingIcon={RiBookMarkedLine}>
            Migrate via API
          </LinkButton>
        </Link>

        {/* <Button variant="primary" leadingIcon={RiRouteFill} className="gap-2">
        Add subscriber
      </Button> */}
      </div>
    </div>
  );
};
