import { useState, useCallback, useEffect } from 'react';

interface PaginationParams {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  offset: number;
}

interface PaginationResult extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (count: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  paginationProps: {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * Custom hook for handling pagination logic
 */
export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
}: PaginationParams = {}): PaginationResult => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [itemCount, setItemCount] = useState(totalItems);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
  
  // Calculate offset for data fetching
  const offset = (currentPage - 1) * pageSize;
  
  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);
  
  // Reset to first page if current page is higher than total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Handler to set the current page
  const setPage = useCallback((page: number) => {
    const pageNumber = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(pageNumber);
  }, [totalPages]);
  
  // Handler to set the page size
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
  }, []);
  
  // Handler to set the total items
  const setTotalItems = useCallback((count: number) => {
    setItemCount(count);
  }, []);
  
  // Navigation helpers
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);
  
  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);
  
  // Props to pass to the Pagination component
  const paginationProps = {
    currentPage,
    totalItems: itemCount,
    pageSize,
    onPageChange: setPage
  };
  
  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    paginationProps
  };
}; 
