import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../utils/api';

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

function ConsumerComponent() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div>Auth Loading...</div>;
  return (
    <div>
      <div data-testid="user-name">{user ? user.name : 'Guest'}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets user to null when /api/auth/me fails', async () => {
    api.get.mockRejectedValue({ status: 401, message: 'Unauthorized' });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Auth Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
    expect(api.get).toHaveBeenCalledWith('/api/auth/me');
  });

  it('loads and sets user when /api/auth/me succeeds', async () => {
    const mockUser = { _id: '123', name: 'Vipin Gupta', email: 'vipin@example.com', role: 'freelancer' };
    api.get.mockResolvedValue({ success: true, user: mockUser });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Auth Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Vipin Gupta');
  });

  it('logout clears user state and calls /api/auth/logout', async () => {
    const mockUser = { _id: '123', name: 'Vipin Gupta', email: 'vipin@example.com', role: 'freelancer' };
    api.get.mockResolvedValue({ success: true, user: mockUser });
    api.post.mockResolvedValue({ success: true });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Vipin Gupta');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
  });
});
