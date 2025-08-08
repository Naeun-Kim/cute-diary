// Home.tsx
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Map } from 'react-kakao-maps-sdk';
import { createClient } from '@supabase/supabase-js';
import FloatingMemo from './components/FloatingMemo';
import EventModal from './components/EventModal';
import type { WalkEvent, KakaoMouseEvent } from './types/walk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// kakao 전역 최소 선언 (any 없이)
declare global {
  interface Window {
    kakao: { maps: { load: (cb: () => void) => void } };
  }
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoReady, setGeoReady] = useState(false);
  const [events, setEvents] = useState<WalkEvent[]>([]);
  const [newEvent, setNewEvent] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<WalkEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from<'walk_events', WalkEvent>('walk_events')
        .select('*');
      if (error) console.error('Error fetching events:', error);
      else setEvents(data ?? []);
    };
    fetchEvents();
  }, []);

  // 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setGeoReady(true);
      },
      () => {
        // 위치 가져오기 실패 시 기본값 설정
        setPosition({ lat: 37.5665, lng: 126.978 });
        setGeoReady(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 지도 클릭 시 새 이벤트 좌표 설정
  const handleMapClick = (_map: unknown, mouseEvent: KakaoMouseEvent) => {
    const latlng = mouseEvent.latLng;
    setNewEvent({ lat: latlng.getLat(), lng: latlng.getLng() });
  };

  // 새 이벤트 저장
  const handleAddEvent = async (icon: WalkEvent['icon'], memo: string) => {
    if (!newEvent) return;
    const newItem: WalkEvent = {
      id: Date.now().toString(),
      lat: newEvent.lat,
      lng: newEvent.lng,
      icon,
      memo,
    };
    setEvents((prev) => [...prev, newItem]);
    //supabase에 저장
    const { error } = await supabase.from('walk_events').insert([newItem]);
    if (error) console.error('Error inserting event:', error);
    setNewEvent(null);
  };

  const handleEdit = (id: string) => {
    setNewEvent(null);
    const evt = events.find((e) => e.id === id);
    if (evt) setEditingEvent(evt);
  };

  const handleUpdateEvent = async (icon: WalkEvent['icon'], memo: string) => {
    if (!editingEvent) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === editingEvent.id ? { ...e, icon, memo } : e))
    );
    const { error } = await supabase
      .from('walk_events')
      .update({ icon, memo })
      .eq('id', editingEvent.id);
    if (error) console.error('Error updating event:', error);
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from('walk_events').delete().eq('id', id);
    if (error) console.error('Error deleting event:', error);
    setEditingEvent(null);
    setNewEvent(null);
  };

  const safeCenter = position ?? { lat: 37.5665, lng: 126.978 };

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`}
        onLoad={() => {
          window.kakao.maps.load(() => setLoaded(true));
        }}
        onError={() => console.error('Failed to load Kakao Maps SDK')}
      />

      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      >
        {/* <header style={{ padding: 12, background: '#fff', zIndex: 1 }}>
          <h1 style={{ margin: 0 }}>어디서 산책해?</h1>
        </header> */}

        {/* 지도 렌더링 */}
        {!loaded || !geoReady ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            위치와 지도를 불러오는 중...
          </div>
        ) : (
          <Map
            center={safeCenter}
            style={{ flex: 1 }}
            level={3}
            onClick={handleMapClick}
          >
            {events.map((event) => (
              <FloatingMemo
                key={event.id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleMemo={() => setNewEvent(null)}
              />
            ))}
          </Map>
        )}

        {/* 이벤트 모달 */}
        {newEvent && !editingEvent && (
          <EventModal
            onClose={() => setNewEvent(null)}
            onSubmit={handleAddEvent}
            initialIcon="💩"
            initialMemo=""
          />
        )}

        {editingEvent && (
          <EventModal
            initialIcon={editingEvent.icon}
            initialMemo={editingEvent.memo}
            onClose={() => setEditingEvent(null)}
            onSubmit={handleUpdateEvent}
          />
        )}
      </div>
    </>
  );
}
