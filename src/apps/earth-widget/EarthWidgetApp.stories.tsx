import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {EarthWidgetApp} from './EarthWidgetApp';

const meta: Meta<typeof EarthWidgetApp> = {
  component: EarthWidgetApp,
};

export default meta;

type Story = StoryObj<typeof EarthWidgetApp>;

export const Basic: Story = {args: {}};
