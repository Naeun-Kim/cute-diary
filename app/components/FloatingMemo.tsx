import { useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import * as styles from './FloatingMemo.css';
import type { WalkEvent } from '../types/walk';

interface FloatingMemoProps {
  events: WalkEvent[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleMemo: () => void;
  currentUserId?: string;
  onAddNewMemo?: (lat: number, lng: number) => void;
}

export default function FloatingMemo({
  events,
  onEdit,
  onDelete,
  onToggleMemo,
  currentUserId,
  onAddNewMemo,
}: FloatingMemoProps) {
  const [showMemo, setShowMemo] = useState(false);
  const firstEvent = events[0];
  const hasMultipleEvents = events.length > 1;

  const isEventOwner = (event: WalkEvent) => {
    return currentUserId === event.user_id;
  };

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // 메모 토글 시, 부모 상태(newEvent) 초기화
    onToggleMemo();
    setShowMemo((prev) => !prev);
  };

  const handleMemoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // 메모 클릭 시 편집모드 진입 기능 제거
  };

  const handleAddNewMemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onAddNewMemo) {
      onAddNewMemo(firstEvent.lat, firstEvent.lng);
    }
    setShowMemo(false); // 메모 오버레이는 닫아두기
  };

  const renderMemoContent = () => {
    if (hasMultipleEvents) {
      return (
        <Swiper
          modules={[Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={false}
          pagination={{ clickable: true }}
          className={`${styles.swiperContainer} ${styles.swiperPagination}`}
        >
          {events.map((event) => (
            <SwiperSlide key={event.id}>
              <div className={styles.memoSlide}>
                <div className={styles.controlContainer}>
                  {isEventOwner(event) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(event.id);
                        }}
                        className={styles.controlButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(event.id);
                        }}
                        className={styles.controlButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
                <div className={styles.iconLarge}>{event.icon}</div>
                <p className={styles.memoText}>{event.memo}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      );
    } else {
      return (
        <>
          <div className={styles.controlContainer}>
            {isEventOwner(firstEvent) && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(firstEvent.id);
                  }}
                  className={styles.controlButton}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(firstEvent.id);
                  }}
                  className={styles.controlButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
          <div className={styles.addButtonContainer}>
            <button
              onClick={handleAddNewMemo}
              className={styles.addButton}
              title="나도 남기기"
            >
              +
            </button>
          </div>
          <div className={styles.iconLarge}>{firstEvent.icon}</div>
          <p className={styles.memoText}>{firstEvent.memo}</p>
        </>
      );
    }
  };

  return (
    <>
      <CustomOverlayMap
        position={{ lat: firstEvent.lat, lng: firstEvent.lng }}
        yAnchor={0.5}
        clickable
      >
        <div onClick={handleIconClick} className={styles.iconStyle}>
          {hasMultipleEvents ? (
            <div className={styles.multipleIconContainer}>
              <span className={styles.multipleIcon}>{firstEvent.icon}</span>
              <span className={styles.eventCount}>{events.length}</span>
            </div>
          ) : (
            firstEvent.icon
          )}
        </div>
      </CustomOverlayMap>
      {showMemo && (
        <CustomOverlayMap
          position={{ lat: firstEvent.lat + 0.00015, lng: firstEvent.lng }}
          yAnchor={1}
          clickable
        >
          <motion.div
            className={styles.memoContainer}
            onClick={handleMemoClick}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={styles.addButtonContainer}>
              <button
                onClick={handleAddNewMemo}
                className={styles.addButton}
                title="나도 남기기"
              >
                +
              </button>
            </div>
            <div className={styles.closeButtonContainer}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMemo(false);
                }}
                className={styles.closeButton}
                title="닫기"
              >
                ×
              </button>
            </div>
            {renderMemoContent()}
          </motion.div>
        </CustomOverlayMap>
      )}
    </>
  );
}
