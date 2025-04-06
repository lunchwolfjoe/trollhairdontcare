import React from 'react';
import { Box, Pagination as MuiPagination, PaginationItem, Typography, useTheme } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showItemCount?: boolean;
}

/**
 * Reusable pagination component with item count display
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  showItemCount = true,
}) => {
  const theme = useTheme();
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate displayed item range
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  
  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return showItemCount && totalItems > 0 ? (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {totalItems} item{totalItems !== 1 ? 's' : ''}
        </Typography>
      </Box>
    ) : null;
  }
  
  const handleChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexWrap: 'wrap',
      py: 2
    }}>
      {showItemCount && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 0 } }}>
          Showing {firstItem}-{lastItem} of {totalItems} item{totalItems !== 1 ? 's' : ''}
        </Typography>
      )}
      
      <MuiPagination
        page={currentPage}
        count={totalPages}
        color="primary"
        shape="rounded"
        onChange={handleChange}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }
            }}
          />
        )}
      />
    </Box>
  );
};

export { Pagination }; 
