import { Input } from './Input';

export default {
  title: 'Components/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with various types and states.',
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

// Basic input
export const Basic = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

// Different types
export const Types = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone number" />
      <Input type="url" placeholder="Website URL" />
      <Input type="search" placeholder="Search..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available input types.',
      },
    },
  },
};

// States
export const States = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <Input placeholder="Normal input" />
      <Input placeholder="Disabled input" disabled />
      <Input placeholder="Read-only input" readOnly />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input in different states.',
      },
    },
  },
};

// With labels
export const WithLabels = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Full Name
        </label>
        <Input placeholder="Enter your full name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phone Number
        </label>
        <Input type="tel" placeholder="Enter your phone number" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with proper labels for accessibility.',
      },
    },
  },
};

// Form example
export const FormExample = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <h3 className="text-lg font-semibold">Contact Form</h3>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Name
        </label>
        <Input placeholder="Your name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <Input type="email" placeholder="your.email@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Message
        </label>
        <Input placeholder="Your message" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complete form example using the Input component.',
      },
    },
  },
};
