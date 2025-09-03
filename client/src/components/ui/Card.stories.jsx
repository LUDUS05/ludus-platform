import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

export default {
  title: 'Components/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections.',
      },
    },
  },
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

// Basic card
export const Basic = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
    </Card>
  ),
};

// Card with footer
export const WithFooter = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This project will be created in your workspace.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

// Activity card example
export const ActivityCard = {
  render: () => (
    <Card className="w-[400px] overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-ludus-orange to-ludus-orange-dark" />
      <CardHeader>
        <CardTitle>Bowling Night</CardTitle>
        <CardDescription>Join us for an evening of bowling and fun!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Location:</span> Aspar Bowling, Riyadh
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Date:</span> August 17, 2025
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Price:</span> 50 SAR
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ludus" className="w-full">Book Now</Button>
      </CardFooter>
    </Card>
  ),
};

// Multiple cards
export const MultipleCards = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
          <CardDescription>First card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the first card.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
          <CardDescription>Second card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the second card.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Card 3</CardTitle>
          <CardDescription>Third card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the third card.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
