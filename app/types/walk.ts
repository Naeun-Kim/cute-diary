// app/types/walk.ts
export type IconType =
  | '💩'
  | '🐾'
  | '🍀'
  | '🐯'
  | '💕'
  | '😺'
  | '🐰'
  | '🦊'
  | '🐙'
  | '🦄';

export type WalkEvent = {
  id: string;
  lat: number;
  lng: number;
  icon: IconType;
  memo: string;
  user_id: string;
  created_at?: string;
};

// Kakao click event에 필요한 최소 타입
export type KakaoLatLng = { getLat(): number; getLng(): number };
export type KakaoMouseEvent = { latLng: KakaoLatLng };
