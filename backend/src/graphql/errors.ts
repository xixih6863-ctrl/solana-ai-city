import { GraphQLError } from 'graphql';

export function authenticationError(message: string = 'Authentication required'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });
}

export function authorizationError(message: string = 'Access denied'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
}

export function validationError(message: string = 'Validation failed'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
    },
  });
}

export function notFoundError(message: string = 'Resource not found'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'NOT_FOUND',
    },
  });
}

export function conflictError(message: string = 'Resource conflict'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'CONFLICT',
    },
  });
}

export function rateLimitError(message: string = 'Too many requests'): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });
}
