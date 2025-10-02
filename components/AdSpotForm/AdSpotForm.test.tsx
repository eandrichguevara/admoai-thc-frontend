import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdSpotForm from './index';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper component with QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('AdSpotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<AdSpotForm />, { wrapper });

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/placement/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ttl minutes/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AdSpotForm />, { wrapper });

      expect(screen.getByRole('button', { name: /create ad spot/i })).toBeInTheDocument();
    });

    it('should render cancel button when onCancel is provided', () => {
      const onCancel = vi.fn();
      render(<AdSpotForm onCancel={onCancel} />, { wrapper });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<AdSpotForm />, { wrapper });

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      render(<AdSpotForm />, { wrapper });

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when image URL is empty', async () => {
      const user = userEvent.setup();
      render(<AdSpotForm />, { wrapper });

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Title');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/image url is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when TTL is less than 1', async () => {
      const user = userEvent.setup();
      render(<AdSpotForm />, { wrapper });

      const ttlInput = screen.getByLabelText(/ttl minutes/i);
      await user.type(ttlInput, '0');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ttl must be at least 1 minute/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'test-id',
              title: 'Test Ad',
              imageUrl: 'https://example.com/image.jpg',
              placement: 'banner',
              status: 'active',
            }),
        } as Response),
      );

      render(<AdSpotForm onSuccess={onSuccess} />, { wrapper });

      const titleInput = screen.getByLabelText(/title/i);
      const imageUrlInput = screen.getByLabelText(/image url/i);

      await user.type(titleInput, 'Test Ad');
      await user.type(imageUrlInput, 'https://example.com/image.jpg');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/adspots',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Test Ad'),
          }),
        );
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should submit form with TTL when provided', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response),
      );

      render(<AdSpotForm />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');
      await user.type(screen.getByLabelText(/ttl minutes/i), '60');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.ttlMinutes).toBe(60);
      });
    });

    it('should select different placement options', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response),
      );

      render(<AdSpotForm />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');

      const placementSelect = screen.getByLabelText(/placement/i);
      await user.selectOptions(placementSelect, 'sidebar');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.placement).toBe('sidebar');
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({}),
              } as Response);
            }, 100);
          }),
      ) as typeof fetch;

      render(<AdSpotForm />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();

      // Wait for submission to complete
      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 200 },
      );
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error occurred' }),
        } as Response),
      );

      render(<AdSpotForm />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
      });
    });

    it('should display generic error when API fails without error message', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        } as Response),
      );

      render(<AdSpotForm />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error: 500/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<AdSpotForm onCancel={onCancel} />, { wrapper });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('should disable cancel button while submitting', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      global.fetch = vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve({}),
              } as Response);
            }, 100);
          }),
      ) as typeof fetch;

      render(<AdSpotForm onCancel={onCancel} />, { wrapper });

      await user.type(screen.getByLabelText(/title/i), 'Test Ad');
      await user.type(screen.getByLabelText(/image url/i), 'https://example.com/image.jpg');

      const submitButton = screen.getByRole('button', { name: /create ad spot/i });
      await user.click(submitButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();

      await waitFor(
        () => {
          expect(cancelButton).not.toBeDisabled();
        },
        { timeout: 200 },
      );
    });
  });
});
