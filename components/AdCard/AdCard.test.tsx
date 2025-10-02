import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdCard } from './index';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

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

describe('AdCard', () => {
  const defaultProps = {
    id: 'test-id-123',
    title: 'Test Ad Title',
    imageUrl: 'https://example.com/image.jpg',
    status: 'active' as const,
    placement: 'banner' as const,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the ad card with all elements', () => {
      render(<AdCard {...defaultProps} />, { wrapper });

      expect(screen.getByText('Test Ad Title')).toBeInTheDocument();
      expect(screen.getByAltText('Test Ad Title')).toBeInTheDocument();
      expect(screen.getByText('banner')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should render with correct image URL through proxy', () => {
      render(<AdCard {...defaultProps} />, { wrapper });

      const image = screen.getByAltText('Test Ad Title');
      expect(image).toHaveAttribute(
        'src',
        `/api/image-proxy?url=${encodeURIComponent(defaultProps.imageUrl)}`,
      );
    });

    it('should display the correct placement', () => {
      render(<AdCard {...defaultProps} placement="sidebar" />, { wrapper });

      expect(screen.getByText('sidebar')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should display active status correctly', () => {
      render(<AdCard {...defaultProps} status="active" />, { wrapper });

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('toggle_on')).toBeInTheDocument();
    });

    it('should display deactivated status correctly', () => {
      render(<AdCard {...defaultProps} status="deactivated" />, { wrapper });

      expect(screen.getByText('deactivated')).toBeInTheDocument();
      expect(screen.getByText('toggle_off')).toBeInTheDocument();
    });

    it('should display paused status correctly', () => {
      render(<AdCard {...defaultProps} status="paused" />, { wrapper });

      expect(screen.getByText('paused')).toBeInTheDocument();
    });
  });

  describe('Toggle Button', () => {
    it('should have correct aria-label for active ad', () => {
      render(<AdCard {...defaultProps} status="active" />, { wrapper });

      const toggleButton = screen.getByLabelText('Deactivate ad');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('title', 'Click to deactivate');
    });

    it('should have correct aria-label for deactivated ad', () => {
      render(<AdCard {...defaultProps} status="deactivated" />, { wrapper });

      const toggleButton = screen.getByLabelText('Activate ad');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('title', 'Click to activate');
    });

    it('should call API when toggle button is clicked', async () => {
      const user = userEvent.setup();

      // Mock the fetch API
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...defaultProps, status: 'deactivated' }),
        } as Response),
      );

      render(<AdCard {...defaultProps} status="active" />, { wrapper });

      const toggleButton = screen.getByLabelText('Deactivate ad');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/adspots/${defaultProps.id}`,
          expect.objectContaining({
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'deactivated' }),
          }),
        );
      });
    });

    it('should toggle from deactivated to active', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...defaultProps, status: 'active' }),
        } as Response),
      );

      render(<AdCard {...defaultProps} status="deactivated" />, { wrapper });

      const toggleButton = screen.getByLabelText('Activate ad');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/adspots/${defaultProps.id}`,
          expect.objectContaining({
            body: JSON.stringify({ status: 'active' }),
          }),
        );
      });
    });
  });

  describe('Different Placements', () => {
    const placements = [
      'banner',
      'sidebar',
      'interstitial',
      'native',
      'video',
      'footer',
      'header',
    ] as const;

    placements.forEach((placement) => {
      it(`should render correctly with ${placement} placement`, () => {
        render(<AdCard {...defaultProps} placement={placement} />, { wrapper });
        expect(screen.getByText(placement)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when toggling status', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as Response),
      );

      render(<AdCard {...defaultProps} status="active" />, { wrapper });

      const toggleButton = screen.getByLabelText('Deactivate ad');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
