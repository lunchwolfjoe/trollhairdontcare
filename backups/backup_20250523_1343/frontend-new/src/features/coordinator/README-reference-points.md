# Durable Reference Points System

This document describes how to set up and use the durable reference points system for the festival maps.

## Overview

The durable reference points system allows you to:

1. Create reference points that associate real-world GPS coordinates with pixel coordinates on map images
2. Share these reference points across multiple maps
3. Calculate the position of a location on any map once you have its real-world coordinates

## Supabase Database Setup

When you're ready to move from localStorage to Supabase, run the SQL in `frontend-new/db/create_reference_points_tables.sql` in the Supabase SQL Editor to create the necessary tables:

- `reference_points` - Stores the real-world GPS coordinates
- `map_reference_points` - Stores the pixel coordinates for each reference point on each map

## How to Use Durable Reference Points

1. Navigate to the Vectorized Map component
2. Click the "Add Global Ref" button
3. Click on a location on the map
4. Enter the real-world GPS coordinates for that location
5. The reference point will be saved and can be used across all maps

You need at least 3 reference points per map to accurately calculate positions.

## Implementation Details

The system uses an affine transformation to convert between GPS coordinates and map pixel coordinates. This is a mathematical transformation that preserves straight lines and ratios of distances.

When fully implemented with Supabase, uncomment the database code in VectorizedMap.tsx and remove the localStorage fallback code.

## Adding a Location with GPS Coordinates

Once you have reference points set up, you can add locations using real-world GPS coordinates:

1. Create the location with its GPS coordinates
2. The system will automatically calculate where to place the location on each map
3. The location will appear correctly positioned on all maps that have sufficient reference points

## Troubleshooting

- If a location appears in the wrong position, add more reference points or check that your existing reference points are accurate
- Make sure reference points are spread out across the map for better accuracy
- Always verify GPS coordinates against a reliable source like Google Maps

## Future Enhancements

- Implement coordinate transformation algorithms that handle map distortion
- Add elevation data for 3D positioning
- Add the ability to import reference points from GIS systems 