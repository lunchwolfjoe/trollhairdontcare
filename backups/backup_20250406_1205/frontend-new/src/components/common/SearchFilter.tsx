import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  useTheme, 
  Paper, 
  Collapse, 
  Button, 
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string; label: string; }[];
  placeholder?: string;
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];
  searchPlaceholder?: string;
  showFilterByDefault?: boolean;
  searchDebounceMs?: number;
}

/**
 * Reusable search and filter component
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  filterOptions = [],
  searchPlaceholder = 'Search...',
  showFilterByDefault = false,
  searchDebounceMs = 300,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(showFilterByDefault);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Initialize filters from filter options
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    filterOptions.forEach(option => {
      initialFilters[option.id] = '';
    });
    setFilters(initialFilters);
  }, [filterOptions]);
  
  // Handle search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, searchDebounceMs);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, searchDebounceMs]);
  
  // Trigger search callback when debounced query changes
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle filter change
  const handleFilterChange = (id: string, value: any) => {
    const newFilters = { ...filters, [id]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    const resetFilters: Record<string, any> = {};
    filterOptions.forEach(option => {
      resetFilters[option.id] = '';
    });
    setFilters(resetFilters);
    onFilter(resetFilters);
  };
  
  // Toggle filters display
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: filterOptions.length > 0 ? 1 : 0 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={handleClearSearch}
                  aria-label="clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mr: filterOptions.length > 0 ? 2 : 0 }}
        />
        
        {filterOptions.length > 0 && (
          <Button
            variant="outlined"
            onClick={toggleFilters}
            startIcon={<FilterListIcon />}
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Filters
          </Button>
        )}
      </Box>
      
      {filterOptions.length > 0 && (
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {filterOptions.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.id}>
                  {option.type === 'select' ? (
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`filter-${option.id}-label`}>{option.label}</InputLabel>
                      <Select
                        labelId={`filter-${option.id}-label`}
                        id={`filter-${option.id}`}
                        value={filters[option.id] || ''}
                        label={option.label}
                        onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {option.options?.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : option.type === 'date' ? (
                    <TextField
                      fullWidth
                      size="small"
                      label={option.label}
                      type="date"
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      label={option.label}
                      placeholder={option.placeholder}
                      value={filters[option.id] || ''}
                      onChange={(e) => handleFilterChange(option.id, e.target.value)}
                    />
                  )}
                </Grid>
              ))}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    color="secondary" 
                    onClick={handleResetFilters}
                    sx={{ mr: 1 }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

export { SearchFilter }; 
