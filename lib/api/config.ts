/**
 * API configuration.
 *
 * baseURL comes from EXPO_PUBLIC_API_BASE_URL (public env vars are inlined
 * at build time by Expo). Falls back to the placeholder BFF host until the
 * real backend exists.
 *
 * USE_MOCKS keeps the UI renderable without a backend. Flip to false (or set
 * EXPO_PUBLIC_USE_MOCKS=false) once the BFF is ready, so UI and BFF can be
 * built in parallel.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.fancymobilenumber.in';

export const USE_MOCKS =
  process.env.EXPO_PUBLIC_USE_MOCKS === 'false' ? false : true;
