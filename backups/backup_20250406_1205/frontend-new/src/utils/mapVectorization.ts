import proj4 from 'proj4';

/**
 * Interface for reference points used in coordinate transformation
 */
export interface ReferencePoint {
  festivalMap: {
    x: number;
    y: number;
  };
  realWorld: {
    lat: number;
    lng: number;
  };
}

/**
 * Interface for a festival map feature
 */
export interface FestivalMapFeature {
  type: "Feature";
  properties: {
    name: string;
    type: string;
    status: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][];
  };
}

/**
 * Interface for a festival map GeoJSON
 */
export interface FestivalMapGeoJSON {
  type: "FeatureCollection";
  features: FestivalMapFeature[];
}

/**
 * Creates a transformation function based on reference points
 * @param referencePoints Array of reference points with festival map coordinates and real-world GPS coordinates
 * @returns A function that transforms festival map coordinates to real-world GPS coordinates
 */
export function createTransformationFunction(referencePoints: ReferencePoint[]): (x: number, y: number) => { lat: number; lng: number } {
  if (referencePoints.length < 3) {
    throw new Error('At least 3 reference points are required for transformation');
  }

  // For now, we'll use a simple linear interpolation
  // In a real implementation, you might want to use more sophisticated methods
  // like polynomial interpolation or spline fitting
  const minX = Math.min(...referencePoints.map(p => p.festivalMap.x));
  const maxX = Math.max(...referencePoints.map(p => p.festivalMap.x));
  const minY = Math.min(...referencePoints.map(p => p.festivalMap.y));
  const maxY = Math.max(...referencePoints.map(p => p.festivalMap.y));
  
  const minLat = Math.min(...referencePoints.map(p => p.realWorld.lat));
  const maxLat = Math.max(...referencePoints.map(p => p.realWorld.lat));
  const minLng = Math.min(...referencePoints.map(p => p.realWorld.lng));
  const maxLng = Math.max(...referencePoints.map(p => p.realWorld.lng));

  return (x: number, y: number) => {
    const lat = minLat + (y - minY) / (maxY - minY) * (maxLat - minLat);
    const lng = minLng + (x - minX) / (maxX - minX) * (maxLng - minLng);
    return { lat, lng };
  };
}

/**
 * Transforms a GeoJSON from festival map coordinates to real-world GPS coordinates
 * @param geoJSON The GeoJSON to transform
 * @param transformFunction The transformation function to use
 * @returns The transformed GeoJSON
 */
export function transformGeoJSON(
  geoJSON: FestivalMapGeoJSON,
  transformFunction: (x: number, y: number) => { lat: number; lng: number }
): FestivalMapGeoJSON {
  const transformedGeoJSON = JSON.parse(JSON.stringify(geoJSON)) as FestivalMapGeoJSON;
  
  // Transform each coordinate in the GeoJSON
  const transformCoordinatesInGeoJSON = (coordinates: any): any => {
    if (Array.isArray(coordinates) && coordinates.length > 0) {
      if (typeof coordinates[0] === 'number') {
        // This is a coordinate pair
        const transformed = transformFunction(coordinates[0], coordinates[1]);
        return [transformed.lng, transformed.lat];
      } else {
        // This is an array of coordinate pairs
        return coordinates.map(transformCoordinatesInGeoJSON);
      }
    }
    return coordinates;
  };
  
  // Transform all coordinates in the GeoJSON
  transformedGeoJSON.features.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      feature.geometry.coordinates = transformCoordinatesInGeoJSON(feature.geometry.coordinates);
    }
  });
  
  return transformedGeoJSON;
}

/**
 * Creates a GeoJSON from an image map
 * @param imageUrl The URL of the image map
 * @param bounds The bounds of the image map
 * @param features Array of features to add to the GeoJSON
 * @returns A GeoJSON representation of the image map
 */
export function createGeoJSONFromImageMap(
  imageUrl: string,
  bounds: [[number, number], [number, number]],
  features: FestivalMapFeature[]
): FestivalMapGeoJSON {
  // Create a feature for the map image bounds
  const mapFeature: FestivalMapFeature = {
    type: "Feature",
    properties: {
      name: "Map Bounds",
      type: "Map",
      status: "Active"
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]],
        [bounds[0][0], bounds[1][1]],
        [bounds[0][0], bounds[0][1]]
      ]]
    }
  };
  
  return {
    type: "FeatureCollection",
    features: [mapFeature, ...features]
  };
}

/**
 * Extracts features from an image map
 * @param imageUrl The URL of the image map
 * @param bounds The bounds of the image map
 * @returns A promise that resolves to an array of features
 */
export async function extractFeaturesFromImageMap(
  imageUrl: string,
  bounds: [[number, number], [number, number]]
): Promise<FestivalMapFeature[]> {
  // This is a placeholder implementation
  // In a real implementation, you would use image processing techniques
  // to extract features from the map
  
  // For now, we'll return some example features
  return [
    {
      type: "Feature",
      properties: {
        name: "Main Stage",
        type: "Stage",
        status: "Active"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [100, 100],
          [200, 100],
          [200, 200],
          [100, 200],
          [100, 100]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Food Court",
        type: "Amenity",
        status: "Active"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [300, 300],
          [400, 300],
          [400, 400],
          [300, 400],
          [300, 300]
        ]]
      }
    }
  ];
} 