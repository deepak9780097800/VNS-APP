/**
 * API configuration.
 *
 * The catalog on admin.fancymobilenumber.in/web/* is public (no auth), so the
 * mobile app hits the backend directly — no BFF/proxy needed. React Native's
 * native fetch is not subject to browser CORS, so direct calls are clean.
 *
 * USE_MOCKS renders the UI without network (handy offline / in sandboxes that
 * can't reach the backend). Default false — the device talks to the real API.
 * Set EXPO_PUBLIC_USE_MOCKS=true to force mocks.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://admin.fancymobilenumber.in';

export const IMAGES_BASE_URL =
  process.env.EXPO_PUBLIC_IMAGES_BASE_URL ?? 'https://d3re4dy3egxmsz.cloudfront.net';

export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
