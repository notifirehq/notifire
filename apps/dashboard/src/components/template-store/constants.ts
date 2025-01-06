export const GENERATE_EXAMPLES = [
  {
    concept: 'Marketplace Platform',
    prompt: "We're building a marketplace platform connecting freelancers with clients",
  },
  {
    concept: 'E-commerce Store',
    prompt: 'We have an e-commerce store selling fashion products',
  },
  {
    concept: 'Learning Platform',
    prompt: "We're developing an online learning platform for students and teachers",
  },
  {
    concept: 'Analytics Dashboard',
    prompt: "We're creating a SaaS analytics dashboard for businesses",
  },
  {
    concept: 'Food Delivery App',
    prompt: 'We have a mobile app for food delivery services',
  },
  {
    concept: 'Social Network',
    prompt: "We're building a professional networking platform for developers",
  },
] as const;

export const FROM_PROMPT_EXAMPLES = [
  {
    concept: 'Welcome Sequence',
    prompt:
      "Send a welcome email when user signs up, then an in-app message after 2 days if they haven't created a project",
  },
  {
    concept: 'Payment Recovery',
    prompt: 'When payment fails, send an email immediately and an SMS if not resolved in 24 hours',
  },
  {
    concept: 'Mention Notifications',
    prompt: 'Notify team members with email + slack when mentioned in comments, with a 5min delay to allow for edits',
  },
  {
    concept: 'Birthday Rewards',
    prompt: "Send birthday email on user's birthday at 9am their local time, with a special discount code",
  },
  {
    concept: 'Task Updates',
    prompt: 'When task status changes to "Done", notify assignee in-app and watchers via email',
  },
  {
    concept: 'Trial Expiration',
    prompt:
      'Send email 7 days before trial ends, then in-app notification 2 days before, and SMS on last day if not upgraded',
  },
] as const;

export const LOADING_MESSAGES = [
  'Teaching AI about your business... 🎓',
  'Consulting with the notification experts... 📬',
  'Brainstorming with digital neurons... 🧠',
  'Untangling the notification spaghetti... 🍝',
  'Summoning the workflow wizards... 🧙‍♂️',
  'Doing some digital heavy lifting... 🏋️‍♂️',
  'Bribing the AI with virtual cookies... 🍪',
  'Training carrier pigeons for backup... 🐦',
  'Convincing robots to work overtime... 🤖',
  'Charging notification crystals... 🔮',
  'Negotiating with the spam filter... 📧',
  'Powering up the notification reactor... ⚡️',
] as const;
