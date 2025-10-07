import { Button } from './Button';

export default {
  title: 'Components/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'ludus', 'ludus-outline', 'ludus-ghost'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    children: {
      control: { type: 'text' },
      description: 'The content inside the button',
    },
  },
};

// Default story
export const Default = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

// All variants
export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="ludus">LUDUS</Button>
      <Button variant="ludus-outline">LUDUS Outline</Button>
      <Button variant="ludus-ghost">LUDUS Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants.',
      },
    },
  },
};

// All sizes
export const Sizes = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
      <Button size="icon">🚀</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes.',
      },
    },
  },
};

// States
export const States = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button variant="ludus" disabled>Disabled LUDUS</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button in different states.',
      },
    },
  },
};

// Interactive example
export const Interactive = {
  args: {
    children: 'Click me!',
    variant: 'ludus',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive button that you can customize using the controls.',
      },
    },
  },
};
