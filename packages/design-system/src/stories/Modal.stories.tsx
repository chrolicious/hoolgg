import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from '../components/surfaces/Modal';
import { Container } from '../components/layout/Container';
import { Button } from '../components/primitives/Button';
import { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Surfaces/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    closeOnBackdropClick: {
      control: 'boolean',
    },
    closeOnEscapeKey: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Container padding="lg">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          size="md"
          padding="lg"
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.5,
            }}
          >
            This is a modal dialog with a title and close button. Click the
            close button or press Escape to dismiss.
          </p>
        </Modal>
      </Container>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Container padding="lg">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Modal with Footer
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          subtitle="This action cannot be undone"
          footer={
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Confirm
              </Button>
            </div>
          }
          size="md"
          padding="lg"
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to proceed? The footer provides a perfect
            place for action buttons.
          </p>
        </Modal>
      </Container>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<
      'sm' | 'md' | 'lg' | 'xl' | null
    >(null);

    return (
      <Container padding="lg">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpenSize('sm')}
          >
            Small
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpenSize('md')}
          >
            Medium
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpenSize('lg')}
          >
            Large
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setOpenSize('xl')}
          >
            Extra Large
          </Button>
        </div>

        <Modal
          isOpen={openSize === 'sm'}
          onClose={() => setOpenSize(null)}
          title="Small Modal"
          size="sm"
          padding="lg"
        >
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
            This is a small modal (320px max-width)
          </p>
        </Modal>

        <Modal
          isOpen={openSize === 'md'}
          onClose={() => setOpenSize(null)}
          title="Medium Modal"
          size="md"
          padding="lg"
        >
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
            This is a medium modal (480px max-width)
          </p>
        </Modal>

        <Modal
          isOpen={openSize === 'lg'}
          onClose={() => setOpenSize(null)}
          title="Large Modal"
          size="lg"
          padding="lg"
        >
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
            This is a large modal (640px max-width)
          </p>
        </Modal>

        <Modal
          isOpen={openSize === 'xl'}
          onClose={() => setOpenSize(null)}
          title="Extra Large Modal"
          size="xl"
          padding="lg"
        >
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
            This is an extra large modal (800px max-width)
          </p>
        </Modal>
      </Container>
    );
  },
};

export const WithLongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Container padding="lg">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Long Content Modal
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Long Content"
          subtitle="Scrollable modal with lots of content"
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          }
          size="lg"
          padding="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '0.95rem',
                    color: '#fff',
                  }}
                >
                  Section {i + 1}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 1.5,
                  }}
                >
                  This modal can scroll when content exceeds the viewport height.
                  The modal will maintain its centered position and allow users
                  to scroll through the content. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </Modal>
      </Container>
    );
  },
};

export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Container padding="lg">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Form Modal
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Item"
          subtitle="Fill in the details below"
          footer={
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Create
              </Button>
            </div>
          }
          size="md"
          padding="lg"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '4px',
                }}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '4px',
                }}
              >
                Description
              </label>
              <textarea
                placeholder="Enter description"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </Modal>
      </Container>
    );
  },
};

export const GradientVariants: Story = {
  render: () => {
    type GradientType = 'purple-pink' | 'blue-purple' | 'cyan-blue' | 'orange-red' | 'pink-orange' | 'green-yellow' | 'purple-orange';
    const [openGradient, setOpenGradient] = useState<GradientType | null>(null);
    const variants: GradientType[] = [
      'purple-pink',
      'blue-purple',
      'cyan-blue',
      'orange-red',
      'pink-orange',
      'green-yellow',
      'purple-orange',
    ];

    return (
      <Container padding="lg">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          {variants.map((variant) => (
            <Button
              key={variant}
              variant="primary"
              size="sm"
              onClick={() => setOpenGradient(variant)}
            >
              {variant}
            </Button>
          ))}
        </div>

        {variants.map((variant) => (
          <Modal
            key={variant}
            isOpen={openGradient === variant}
            onClose={() => setOpenGradient(null)}
            title={`${variant} Gradient`}
            subtitle="2-color gradient border"
            gradientVariant={variant}
            size="md"
            padding="lg"
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.5,
              }}
            >
              This modal uses the {variant} gradient variant for the border.
            </p>
          </Modal>
        ))}
      </Container>
    );
  },
};
