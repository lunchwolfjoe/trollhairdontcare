import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Pagination } from './Pagination';

// Column definition
export interface TableColumn<T> {
  id: string;
  label: string;
  accessor: (item: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

// Action definition
export interface TableAction<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (item: T) => void;
  condition?: (item: T) => boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

// Props definition
interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  keyExtractor: (item: T) => string;
  pagination?: {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
}

/**
 * Reusable data table component
 */
function DataTable<T>({
  data,
  columns,
  actions = [],
  keyExtractor,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  sortConfig,
  onSort,
}: DataTableProps<T>) {
  const theme = useTheme();
  
  // Handler for sort click
  const handleSortClick = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
        <Box sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
  
  // Render loading skeletons
  const renderLoadingSkeletons = () => 
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column) => (
          <TableCell key={`skeleton-cell-${column.id}`} width={column.width}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
        {actions.length > 0 && (
          <TableCell width="120px">
            <Skeleton variant="text" />
          </TableCell>
        )}
      </TableRow>
    ));
  
  // Sort indicator icon
  const getSortIndicator = (columnId: string) => {
    if (!sortConfig || sortConfig.key !== columnId) return null;
    
    return (
      <Chip 
        size="small" 
        label={sortConfig.direction === 'asc' ? '↑' : '↓'}
        sx={{ 
          height: 20, 
          fontSize: '0.7rem', 
          ml: 1,
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      />
    );
  };
  
  return (
    <Box>
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  width={column.width} 
                  align={column.align || 'left'}
                  onClick={column.sortable && onSort ? () => handleSortClick(column.id) : undefined}
                  sx={{ 
                    fontWeight: 'bold',
                    cursor: column.sortable ? 'pointer' : 'default',
                    backgroundColor: theme.palette.grey[50],
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {column.label}
                    {column.sortable && getSortIndicator(column.id)}
                  </Box>
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell 
                  width="120px" 
                  align="center"
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.grey[50],
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeletons()
            ) : data.length > 0 ? (
              data.map((item) => (
                <TableRow key={keyExtractor(item)} hover>
                  {columns.map((column) => (
                    <TableCell 
                      key={`cell-${keyExtractor(item)}-${column.id}`} 
                      align={column.align || 'left'}
                    >
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {actions
                          .filter(action => !action.condition || action.condition(item))
                          .map((action, index) => (
                            <Tooltip key={index} title={action.label}>
                              <IconButton
                                size="small"
                                color={action.color || 'primary'}
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              renderEmptyState()
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && !loading && (
        <Box sx={{ mt: 2 }}>
          <Pagination {...pagination} />
        </Box>
      )}
    </Box>
  );
}

export { DataTable }; 
