// Mock for next-intl/middleware
const mockIntlMiddleware = jest.fn(() => jest.fn((req) => new Response('OK')));

export default mockIntlMiddleware;