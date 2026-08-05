import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ImageUploader } from '@/components/common';
import { ExhibitionHeader } from '@/components/exhibition-register';
import { RequiredLabel } from '@/components/ui';
import { useImageUpload } from '@/hooks/useImageUpload';
import { usePersonalArtworkPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-transparent border-b border-input-border typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none';

export function PersonalArtworksRegister() {
  const navigate = useNavigate();
  const personalArtworkPolicy = usePersonalArtworkPolicy();
  const canCreatePersonalArtwork = hasPermission(personalArtworkPolicy, 'create');

  const { images, addImages, removeImage } = useImageUpload();
  const {
    images: processImages,
    addImages: addProcessImages,
    removeImage: removeProcessImage,
  } = useImageUpload();
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [year, setYear] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [thoughts, setThoughts] = useState('');

  const isFormValid =
    canCreatePersonalArtwork &&
    images.length > 0 &&
    title.trim() !== '' &&
    year.trim() !== '' &&
    material.trim() !== '';

  return (
    <div className="w-96 h-screen mx-auto flex flex-col bg-page overflow-hidden">
      <ExhibitionHeader title="작품 등록" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-5 pt-2 pb-8">
          <div className="self-stretch flex justify-center">
            <ImageUploader
              images={images}
              maxImages={4}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              emptyLabel="이미지 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-title">
              작품명
            </RequiredLabel>
            <input
              id="artwork-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품명을 입력해주세요"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-intro">작품설명</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-intro"
                value={intro}
                maxLength={1500}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="작품에 대해 소개해주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {intro.length}/1500
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-year">
              제작연도
            </RequiredLabel>
            <input
              id="artwork-year"
              value={year}
              maxLength={4}
              onChange={(e) => setYear(e.target.value)}
              placeholder="YYYY"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel required htmlFor="artwork-material">
              재료/매체
            </RequiredLabel>
            <input
              id="artwork-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="아크릴, 캔버스"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-size">규격</RequiredLabel>
            <input
              id="artwork-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="90 × 120 cm"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel>작품과정</RequiredLabel>
            <ImageUploader
              images={processImages}
              maxImages={4}
              onAddImages={addProcessImages}
              onRemoveImage={removeProcessImage}
              emptyLabel="작업과정 업로드"
            />
          </div>

          <div className="flex flex-col gap-3">
            <RequiredLabel htmlFor="artwork-thoughts">감상 포인트</RequiredLabel>
            <div className="px-3 py-2.5 border-b border-input-border flex flex-col gap-2">
              <textarea
                id="artwork-thoughts"
                value={thoughts}
                maxLength={1500}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder="관람자가 작품을 볼 때 참고하면 좋은 내용을 적어주세요"
                className="h-28 w-full resize-none bg-transparent typo-body-xs-regular text-main placeholder:text-input-placeholder outline-none"
              />
              <div className="w-full text-right typo-body-xs-regular text-faint">
                {thoughts.length}/1500
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-5 py-4 bg-card border-t border-line shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={() =>
            navigate('/exhibition/basic', {
              state: { images, title, intro, year, material, size, thoughts },
            })
          }
          className="w-full h-11 py-3 bg-dark rounded-xl typo-body-sm-bold text-card inline-flex justify-center items-center gap-1.5 disabled:opacity-40"
        >
          등록하기
        </button>
      </footer>
    </div>
  );
}
