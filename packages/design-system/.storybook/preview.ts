import type { Preview } from '@storybook/react-vite';
import '../src/css/variables.css';
import '@flaticon/flaticon-uicons/css/all/all.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'hool-base',
      values: [
        { name: 'hool-base', value: '#0e0b12' },
        { name: 'hool-surface', value: '#19151e' },
        { name: 'hool-elevated', value: '#221d29' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
