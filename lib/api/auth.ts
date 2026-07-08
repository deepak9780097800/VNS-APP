import { apiFetch } from './client';
import { USE_MOCKS } from './config';
import type { User } from './types';

export interface RequestOtpResult {
  /** Echoed back so the OTP screen knows which number to verify. */
  phone: string;
  /** Present only in mock mode as a dev convenience. */
  devOtp?: string;
}

export interface VerifyOtpResult {
  token: string;
  user: User;
}

export async function requestOtp(phone: string): Promise<RequestOtpResult> {
  if (USE_MOCKS) {
    return { phone, devOtp: '1234' };
  }
  return apiFetch<RequestOtpResult>('/auth/otp/request', {
    method: 'POST',
    body: { phone },
    skipAuth: true,
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<VerifyOtpResult> {
  if (USE_MOCKS) {
    // Accept the dev OTP; reject anything else to exercise the error path.
    if (otp !== '1234') {
      throw new Error('Invalid OTP');
    }
    return {
      token: 'mock-token',
      user: { id: 'u1', phone, name: 'Guest User' },
    };
  }
  return apiFetch<VerifyOtpResult>('/auth/otp/verify', {
    method: 'POST',
    body: { phone, otp },
    skipAuth: true,
  });
}
