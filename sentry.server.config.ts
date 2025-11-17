import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Server-specific configuration
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',

  // Disable session replay on server
  integrations: [],

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
      delete event.request.headers['x-api-key']
    }

    // Remove query params that might contain sensitive data
    if (event.request?.query_string && typeof event.request.query_string === 'string') {
      const queryString = event.request.query_string
      const sensitiveParams = ['token', 'apiKey', 'secret', 'password']

      let filteredQuery = queryString
      sensitiveParams.forEach((param) => {
        if (filteredQuery.includes(param)) {
          filteredQuery = filteredQuery
            .split('&')
            .filter((q) => !q.startsWith(param))
            .join('&')
        }
      })

      event.request.query_string = filteredQuery
    }

    return event
  },
})
