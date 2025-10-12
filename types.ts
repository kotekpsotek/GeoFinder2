
export enum AppStatus {
  INITIAL = 'INITIAL',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface LocationData {
  latitude: number;
  longitude: number;
  placeName: string;
  description: string;
}

export interface AnalysisResponse {
  locationFound: boolean;
  location?: LocationData;
  reason?: string;
}
