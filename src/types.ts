export interface ImageItem {
  id: string;
  dataUrl: string;
  caption: string;
}

export interface TrailReport {
  id: number;
  title: string;
  park: string;
  description: string;
  distance: number; // in km
  duration: string; // format "H:M"
  elevationGain: number; // in meters
  gpxFileName: string | null;
  gpxData: {
    points: { lat: number; lon: number; ele: number }[];
    elevationProfile: number[];
  } | null;
  images: ImageItem[];
  timestamp: number;
  isDraft: boolean;
}

export interface AndroidFile {
  name: string;
  path: string;
  language: string;
  content: string;
}
