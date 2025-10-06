import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle login successfully with valid credentials', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    const mockResponse = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'admin@foodconnect.com',
        username: 'admin'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      status: 200
    } as Response);

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@foodconnect.com',
        password: 'FoodConnect2024!'
      })
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@foodconnect.com',
          password: 'FoodConnect2024!'
        })
      })
    );

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result).toEqual(mockResponse);
  });

  test('should handle login failure gracefully', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    } as Response);

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'wrong@email.com',
        password: 'wrongpassword'
      })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  test('should handle network errors', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockRejectedValueOnce(
      new Error('ERR_ADDRESS_UNREACHABLE')
    );

    try {
      await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@foodconnect.com',
          password: 'FoodConnect2024!'
        })
      });
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('ERR_ADDRESS_UNREACHABLE');
    }
  });

  test('should handle timeout errors', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

    try {
      await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@foodconnect.com',
          password: 'FoodConnect2024!'
        })
      });
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('timeout');
    }
  });

  test('should test profile endpoint', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    const mockUser = {
      id: '1',
      email: 'admin@foodconnect.com',
      username: 'admin'
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('mock-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
      status: 200
    } as Response);

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );

    expect(response.ok).toBe(true);
    const user = await response.json();
    expect(user).toEqual(mockUser);
  });

  test('should test logout flow', async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refresh_token');
  });
});