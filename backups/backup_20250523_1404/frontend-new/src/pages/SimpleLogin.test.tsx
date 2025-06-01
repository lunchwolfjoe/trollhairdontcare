// src/pages/SimpleLogin.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { SimpleLogin } from './SimpleLogin';
import { SimpleAuthProvider, useSimpleAuth } from '../contexts/SimpleAuthContext';

// Mock the useSimpleAuth hook
vi.mock('../contexts/SimpleAuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/SimpleAuthContext')>();
  return {
    ...actual,
    useSimpleAuth: vi.fn(),
  };
});

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('SimpleLogin Component', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockMockSignIn = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Provide default mock values for the context
    (useSimpleAuth as vi.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      authenticated: false,
      activeRole: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
      mockSignIn: mockMockSignIn,
      getAuthHeaders: vi.fn(() => ({ 'apikey': 'mock-key' })),
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter> { /* Wrap with BrowserRouter */}
        // Remove the provider wrapper, as the hook is mocked directly
        // <SimpleAuthProvider>
          <SimpleLogin />
        // </SimpleAuthProvider>
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
  });

  it('allows typing into email and password fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls signIn on form submission with correct credentials', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(true); // Simulate successful sign-in
    renderComponent();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays an error message if signIn fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    // Simulate sign-in failure by updating the context mock
    (useSimpleAuth as vi.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: errorMessage, // Simulate error from context
      authenticated: false,
      activeRole: null,
      signIn: mockSignIn.mockResolvedValue(false), // signIn itself might return false or context updates error
      signUp: mockSignUp,
      signOut: vi.fn(),
      mockSignIn: mockMockSignIn,
      getAuthHeaders: vi.fn(() => ({})),
    });

    // We need the rerender function from render
    const { rerender } = render(
      <BrowserRouter>
        <SimpleLogin />
      </BrowserRouter>
    );

    // Update the mock *after* initial render and then rerender
    (useSimpleAuth as vi.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: errorMessage, // Set the error
      authenticated: false,
      activeRole: null,
      signIn: mockSignIn.mockResolvedValue(false),
      signUp: mockSignUp,
      signOut: vi.fn(),
      mockSignIn: mockMockSignIn,
      getAuthHeaders: vi.fn(() => ({})),
    });

    // Rerender the component with the updated mock context implicitly applied
    rerender(
      <BrowserRouter>
        <SimpleLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(signInButton);

    // Debug the DOM structure right after the click
    screen.debug();

    // Wait for the error message to appear using findByRole
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(errorMessage);

    // Check that signIn was still called
    expect(mockSignIn).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
  });

  it('switches to sign up tab and shows sign up fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    await user.click(signUpTab);

    // Use findBy* which waits for elements to appear
    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    // Need unique labels or test IDs if labels are the same
    expect(await screen.findByLabelText(/email address/i)).toBeInTheDocument(); // Assuming unique ID or reused state
    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument(); // Assuming unique ID or reused state
    expect(await screen.findByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('calls signUp on sign up form submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue(undefined); // Simulate successful sign-up
      renderComponent();

      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);

      const fullNameInput = await screen.findByLabelText(/full name/i);
      const emailInput = await screen.findByLabelText(/email address/i); // Ensure this selector is specific enough or wait for it
      const passwordInput = await screen.findByLabelText(/password/i); // Ensure this selector is specific enough or wait for it
      const createButton = await screen.findByRole('button', { name: /create account/i });

      await user.type(fullNameInput, 'Test User');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'newpassword123');
      await user.click(createButton);

      await waitFor(() => {
          expect(mockSignUp).toHaveBeenCalledTimes(1);
          expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'newpassword123', { full_name: 'Test User' });
      });

      // Optionally check for success message
      // expect(await screen.findByRole('alert')).toHaveTextContent(/account created successfully/i);
  });

  // Add more tests: e.g., redirect on success, sign up validation, mock sign in buttons
}); 