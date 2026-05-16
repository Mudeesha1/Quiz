/**
 * Quiz Master Design System - Component Library Demo
 * Shows all available components and how to use them
 */

import { useState } from 'react';
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  Card,
  QuizCard,
  CardContent,
  CardHeader,
  CardFooter,
  Chip,
  ChipGroup,
  ProgressBar,
  TextInput,
  Select,
  Badge,
  Toast,
  useToast,
} from './index';

export function ComponentLibraryDemo() {
  const [selectedChip, setSelectedChip] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ type: 'success', message: '' });
  const toast = useToast();

  const handleShowToast = (type, message) => {
    setToastConfig({ type, message });
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-surface p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-display-lg text-primary mb-2">Quiz Master</h1>
          <p className="text-body-lg text-on-surface-variant">
            Design System Component Library
          </p>
        </div>

        {/* Colors Showcase */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Color Palette</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-24 bg-primary rounded-lg shadow-md" />
                <p className="text-label-lg font-bold">Primary</p>
                <p className="text-body-md text-on-surface-variant">#3525cd</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-secondary-container rounded-lg shadow-md" />
                <p className="text-label-lg font-bold">Secondary</p>
                <p className="text-body-md text-on-surface-variant">#fea619</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-success rounded-lg shadow-md" />
                <p className="text-label-lg font-bold">Success</p>
                <p className="text-body-md text-on-surface-variant">#10b981</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-error rounded-lg shadow-md" />
                <p className="text-label-lg font-bold">Error</p>
                <p className="text-body-md text-on-surface-variant">#ba1a1a</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-24 bg-surface-container rounded-lg shadow-md border border-outline-variant" />
                <p className="text-label-lg font-bold">Surface</p>
                <p className="text-body-md text-on-surface-variant">#edeef0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Buttons</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-label-lg font-bold">Primary Button</p>
                <div className="flex flex-wrap gap-4">
                  <ButtonPrimary onClick={() => handleShowToast('success', 'Primary button clicked!')}>
                    Get Started
                  </ButtonPrimary>
                  <ButtonPrimary disabled>Disabled</ButtonPrimary>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-label-lg font-bold">Secondary Button</p>
                <div className="flex flex-wrap gap-4">
                  <ButtonSecondary onClick={() => handleShowToast('info', 'Secondary button clicked!')}>
                    Learn More
                  </ButtonSecondary>
                  <ButtonSecondary disabled>Disabled</ButtonSecondary>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-label-lg font-bold">Tertiary Button</p>
                <div className="flex flex-wrap gap-4">
                  <ButtonTertiary onClick={() => handleShowToast('info', 'Tertiary button clicked!')}>
                    Cancel
                  </ButtonTertiary>
                  <ButtonTertiary disabled>Disabled</ButtonTertiary>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Card */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Quiz Card</h2>
          </CardHeader>
          <CardContent>
            <QuizCard>
              <h3 className="text-headline-md mb-4">
                What is the capital of Sri Lanka?
              </h3>
              <ChipGroup className="mb-6">
                <Chip
                  selected={selectedChip === 'colombo'}
                  onClick={() => setSelectedChip('colombo')}
                >
                  Colombo
                </Chip>
                <Chip
                  selected={selectedChip === 'jaffna'}
                  onClick={() => setSelectedChip('jaffna')}
                >
                  Jaffna
                </Chip>
                <Chip
                  selected={selectedChip === 'kandy'}
                  onClick={() => setSelectedChip('kandy')}
                >
                  Kandy
                </Chip>
              </ChipGroup>
              <div className="flex gap-4">
                <ButtonPrimary
                  onClick={() =>
                    selectedChip === 'colombo'
                      ? handleShowToast('success', 'Correct! 🎉')
                      : handleShowToast('error', 'Incorrect! Try again.')
                  }
                >
                  Submit Answer
                </ButtonPrimary>
              </div>
            </QuizCard>
          </CardContent>
        </Card>

        {/* Chips with States */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Chip States</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-label-lg font-bold">Default & Selected</p>
                <ChipGroup>
                  <Chip>Unselected</Chip>
                  <Chip selected>Selected</Chip>
                </ChipGroup>
              </div>

              <div className="space-y-3">
                <p className="text-label-lg font-bold">Feedback States</p>
                <ChipGroup>
                  <Chip correct>Correct ✓</Chip>
                  <Chip incorrect>Incorrect ✕</Chip>
                </ChipGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Progress Bar</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <ProgressBar value={30} max={100} label="Quiz Progress" />
              <ProgressBar value={65} max={100} label="Learning Path" />
              <ProgressBar value={100} max={100} label="Module Complete" />
            </div>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Input Fields</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-w-md">
              <TextInput
                label="Full Name"
                placeholder="Enter your name"
              />
              <TextInput
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
              <TextInput
                label="With Error"
                placeholder="This field has an error"
                error="This field is required"
              />
              <Select
                label="Grade Level"
                options={[
                  { label: 'Select Grade', value: '' },
                  { label: 'Grade 6', value: 'grade6' },
                  { label: 'Grade 7', value: 'grade7' },
                  { label: 'Grade 8', value: 'grade8' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Badges</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Achievement Unlocked</Badge>
              <Badge variant="warning">In Progress</Badge>
              <Badge variant="error">Requires Review</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Animations */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Animations</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-label-lg font-bold">Float Animation</p>
                <div className="flex justify-center">
                  <div className="text-6xl animate-float">⭐</div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-label-lg font-bold">Pop-In Animation</p>
                <ButtonPrimary onClick={() => handleShowToast('success', 'Pop-in effect!')}>
                  Trigger Pop-In
                </ButtonPrimary>
              </div>

              <div className="space-y-3">
                <p className="text-label-lg font-bold">Pulse Glow Animation</p>
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary rounded-full animate-pulse-glow" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Demo */}
        <Card className="mb-12">
          <CardHeader>
            <h2 className="text-headline-md">Toast Notifications</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <ButtonPrimary
                onClick={() => toast.success('Great job! Keep going! 🎉')}
              >
                Success Toast
              </ButtonPrimary>
              <ButtonSecondary
                onClick={() => toast.error('Oops! Something went wrong. 😢')}
              >
                Error Toast
              </ButtonSecondary>
              <ButtonTertiary
                onClick={() => toast.info('This is an informational message.')}
              >
                Info Toast
              </ButtonTertiary>
            </div>
          </CardContent>
        </Card>

        {/* Toast Container */}
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-full md:max-w-md space-y-2 pointer-events-none">
          {toast.toasts.map((t) => (
            <Toast
              key={t.id}
              type={t.type}
              message={t.message}
              duration={t.duration}
              onClose={() => toast.removeToast(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ComponentLibraryDemo;
