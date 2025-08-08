'use client';

import { useState } from 'react';

export default function Select() {
  const items = [
    '산책',
    '밥',
    '배변',
    '놀이',
    '잠',
    '몸무게',
    '미용',
    '병원',
    '그외',
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl">뭐했는지 고르기</h1>
        <section>
          <ul className="grid grid-cols-3 gap-4 sm:gap-6">
            {items.map((item, index) => {
              const isSelected = selectedItems.includes(item);
              return (
                <li
                  key={index}
                  onClick={() => toggleItem(item)}
                  className={`cursor-pointer select-none px-4 py-2 rounded-lg border text-center transition-all
                ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-black border-gray-300'
                }
                hover:shadow-md`}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
