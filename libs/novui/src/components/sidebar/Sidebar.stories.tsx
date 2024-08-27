import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Sidebar as CSidebar, SidebarProps } from './Sidebar';

export default {
  title: 'Components/Sidebar',
  args: {
    title: 'Title',
  },
} as Meta<SidebarProps>;

const SidebarWrapper = ({ title }: SidebarProps) => {
  return (
    <CSidebar
      title={title}
      onClose={() => {
        alert('onClose triggered');
      }}
    >
      {null}
    </CSidebar>
  );
};

const Template: StoryFn<SidebarProps> = ({ ...args }) => <SidebarWrapper {...args} />;

export const Sidebar = Template.bind({});
Sidebar.args = {};
