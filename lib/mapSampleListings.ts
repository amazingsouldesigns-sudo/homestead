/**
 * Demo markers for the map when listings have no lat/lng yet.
 * Replace this flow with Supabase-loaded rows that include coordinates.
 */
export interface MapListingMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const SAMPLE_PROPERTY_MARKERS: MapListingMarker[] = [
  { id: 'sample-center', name: 'Homestead — map center (Jamaica)', latitude: 18.0179, longitude: -76.8099 },
  { id: 'sample-1', name: 'Example listing — Hope Road area', latitude: 18.0225, longitude: -76.805 },
  { id: 'sample-2', name: 'Example listing — waterfront', latitude: 18.012, longitude: -76.815 },
];
