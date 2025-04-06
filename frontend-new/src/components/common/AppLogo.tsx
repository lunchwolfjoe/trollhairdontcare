import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  textColor?: string;
  sx?: SxProps<Theme>;
  portalType?: 'volunteer' | 'coordinator' | 'admin';
}

/**
 * A reusable component for displaying the Kerrville Folk Festival logo
 * across the application with consistent styling
 */
const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium', 
  showText = true,
  textColor = 'primary.main',
  sx = {},
  portalType = 'coordinator'
}) => {
  // Define logo sizes
  const sizes = {
    small: 60,
    medium: 100,
    large: 140
  };

  // Get the portal type text
  const getPortalTypeText = () => {
    switch (portalType) {
      case 'volunteer':
        return 'Volunteer Portal';
      case 'admin':
        return 'Admin Portal';
      case 'coordinator':
      default:
        return 'Coordinator Portal';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      ...sx
    }}>
      {/* Festival Logo */}
      <img 
        src="https://www.kerrvillefolkfestival.org/wp-content/uploads/2025/03/KFF2025_Art_Sticker.png"
        alt="Kerrville Folk Festival" 
        style={{ 
          width: sizes[size], 
          height: 'auto',
          marginBottom: showText ? '8px' : '0',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
        }} 
      />
      
      {/* Festival name and portal type */}
      {showText && (
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          align="center"
          sx={{ fontSize: size === 'small' ? '0.7rem' : '0.8rem' }}
        >
          {getPortalTypeText()}
        </Typography>
      )}
    </Box>
  );
};

export { AppLogo }; 