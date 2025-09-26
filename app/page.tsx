// Home.tsx
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Map } from 'react-kakao-maps-sdk';
import {
  createClient,
  type User,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import FloatingMemo from './components/FloatingMemo';
import EventModal from './components/EventModal';
import AuthBar from './components/AuthBar';
import type { WalkEvent, KakaoMouseEvent } from './types/walk';

// 같은 위치에 있는 이벤트들을 그룹핑하는 함수
const groupEventsByLocation = (events: WalkEvent[]): WalkEvent[][] => {
  const groups: Record<string, WalkEvent[]> = {};

  events.forEach((event) => {
    // 위치를 문자열로 변환하여 그룹핑 키로 사용 (소수점 6자리까지)
    const locationKey = `${event.lat.toFixed(6)},${event.lng.toFixed(6)}`;

    if (!groups[locationKey]) {
      groups[locationKey] = [];
    }
    groups[locationKey].push(event);
  });

  return Object.values(groups);
};

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
  const [user, setUser] = useState<User | null>(null);
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

  //로그인 상태 구독
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = (await supabase
        .from('walk_events')
        .select('*')) as PostgrestSingleResponse<WalkEvent[]>;
      if (error) console.error('Error fetching events:', error);
      else setEvents(data ?? []);
    };
    fetchEvents();
  }, [user]);

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
    if (!user) {
      alert('로그인 후에 메모를 추가할 수 있어요 🙂');
      return;
    }
    const latlng = mouseEvent.latLng;
    setNewEvent({ lat: latlng.getLat(), lng: latlng.getLng() });
  };

  // 새 이벤트 저장
  const handleAddEvent = async (icon: WalkEvent['icon'], memo: string) => {
    if (!newEvent || !user) return;
    const newItem: WalkEvent = {
      id: Date.now().toString(),
      lat: newEvent.lat,
      lng: newEvent.lng,
      icon,
      memo,
      user_id: user.id,
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
    if (!editingEvent || !user) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === editingEvent.id ? { ...e, icon, memo } : e))
    );
    const { error } = await supabase
      .from('walk_events')
      .update({ icon, memo })
      .eq('id', editingEvent.id)
      .eq('user_id', user.id);
    if (error) console.error('Error updating event:', error);
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase
      .from('walk_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Error deleting event:', error);
    setEditingEvent(null);
    setNewEvent(null);
  };

  const handleAddNewMemo = (lat: number, lng: number) => {
    if (!user) {
      alert('로그인 후에 메모를 추가할 수 있어요 🙂');
      return;
    }
    setNewEvent({ lat, lng });
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

        <div>
          <AuthBar />
        </div>

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
            {groupEventsByLocation(events).map(
              (eventGroup: WalkEvent[], groupIndex: number) => (
                <FloatingMemo
                  key={`group-${groupIndex}`}
                  events={eventGroup}
                  isOwner={eventGroup.some(
                    (event: WalkEvent) => user?.id === event.user_id
                  )}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleMemo={() => setNewEvent(null)}
                  currentUserId={user?.id}
                  onAddNewMemo={handleAddNewMemo}
                />
              )
            )}
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
