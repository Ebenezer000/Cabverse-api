/* eslint-disable @typescript-eslint/no-explicit-any */

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface ResponseFormat<T> {
  status_code: number;
  status: boolean;
  message: string;
  pagination?: PaginationInfo;
  data: T;
}

// Extract pagination params from URL
export function getPaginationParams(searchParams: URLSearchParams): PaginationOptions {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

  return { page, limit, sortBy, order };
}

// Build prisma pagination for any model
export function buildPrismaPagination<T extends { skip?: number; take?: number; orderBy?: any }>(
  options: PaginationOptions
): Pick<T, 'skip' | 'take' | 'orderBy'> {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = options;

  return {
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: order },
  };
}

// Format API response
export function formatResponse<T>(
  status_code: number,
  message: string,
  data: T,
  pagination?: PaginationInfo
): ResponseFormat<T> {
  return {
    status_code,
    status: status_code >= 200 && status_code < 300,
    message,
    pagination,
    data,
  };
}
