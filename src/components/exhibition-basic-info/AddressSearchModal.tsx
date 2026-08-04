import { useState } from 'react';

import { MapPin, Search, X } from 'lucide-react';

import { InputBox } from './InputBox';

interface KakaoAddressDocument {
  address_name: string;
  road_address?: {
    address_name: string;
    building_name: string;
  } | null;
  address?: {
    address_name: string;
  };
  x: string; // longitude
  y: string; // latitude
}

interface KakaoAddressResponse {
  documents: KakaoAddressDocument[];
  meta: {
    total_count: number;
  };
}

interface AddressResult {
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  latitude: number;
  longitude: number;
}

interface AddressSearchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (address: string, detailAddress: string, latitude: number, longitude: number) => void;
}

export function AddressSearchModal({ open, onClose, onConfirm }: AddressSearchModalProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [detailAddress, setDetailAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const searchAddress = async () => {
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('주소 검색에 실패했습니다');
      }

      const data: KakaoAddressResponse = await response.json();

      if (data.documents.length === 0) {
        setError('검색 결과가 없습니다');
        setResults([]);
        return;
      }

      const addressResults: AddressResult[] = data.documents.map((doc) => ({
        roadAddress: doc.road_address?.address_name || '',
        jibunAddress: doc.address?.address_name || doc.address_name,
        buildingName: doc.road_address?.building_name || '',
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
      }));

      setResults(addressResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주소 검색 중 오류가 발생했습니다');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress();
    }
  };

  const handleSelectAddress = (address: AddressResult) => {
    setSelectedAddress(address);
    setDetailAddress('');
  };

  const handleConfirm = () => {
    if (!selectedAddress) return;

    const fullAddress = selectedAddress.roadAddress || selectedAddress.jibunAddress;
    const finalAddress = detailAddress.trim()
      ? `${fullAddress} ${detailAddress.trim()}`
      : fullAddress;

    onConfirm(
      finalAddress,
      detailAddress.trim(),
      selectedAddress.latitude,
      selectedAddress.longitude,
    );
    handleClose();
  };

  const handleClose = () => {
    setKeyword('');
    setResults([]);
    setSelectedAddress(null);
    setDetailAddress('');
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col bg-page">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-sub600 px-5 py-4">
        <h2 className="typo-body-lg-bold text-main">주소 검색</h2>
        <button type="button" aria-label="닫기" onClick={handleClose} className="p-1">
          <X className="size-6 text-main" strokeWidth={1.5} />
        </button>
      </div>

      {!selectedAddress ? (
        <>
          {/* 검색 영역 */}
          <div className="px-5 py-4">
            <div className="flex items-stretch gap-2">
              <InputBox className="flex-1">
                <Search className="size-4 shrink-0 text-faint" strokeWidth={1.5} />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="도로명, 건물명 또는 지번 검색"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
                  autoFocus
                />
              </InputBox>
              <button
                type="button"
                onClick={searchAddress}
                disabled={isSearching}
                className="typo-body-xs-bold rounded-lg bg-dark px-4 py-2.5 text-white disabled:opacity-40"
              >
                {isSearching ? '검색중' : '검색'}
              </button>
            </div>
            {error && <p className="typo-body-xs-regular mt-2 text-red-500">{error}</p>}
          </div>

          {/* 검색 결과 */}
          <div className="flex-1 overflow-y-auto px-5">
            {results.length > 0 && (
              <div className="flex flex-col gap-2">
                {results.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAddress(result)}
                    className="flex items-start gap-3 rounded-lg border border-sub600 bg-card p-4 text-left transition-colors hover:bg-box100"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-main" strokeWidth={1.5} />
                    <div className="flex flex-col gap-1">
                      {result.roadAddress && (
                        <p className="typo-body-sm-medium text-main">
                          {result.roadAddress}
                          {result.buildingName && (
                            <span className="typo-body-xs-regular ml-1 text-faint">
                              ({result.buildingName})
                            </span>
                          )}
                        </p>
                      )}
                      <p className="typo-body-xs-regular text-faint">{result.jibunAddress}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 상세주소 입력 */}
          <div className="flex-1 px-5 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="typo-body-sm-bold text-main">선택한 주소</label>
                <div className="rounded-lg border border-sub600 bg-card p-4">
                  <p className="typo-body-sm-medium text-main">
                    {selectedAddress.roadAddress || selectedAddress.jibunAddress}
                  </p>
                  {selectedAddress.buildingName && (
                    <p className="typo-body-xs-regular mt-1 text-faint">
                      ({selectedAddress.buildingName})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="detail-address" className="typo-body-sm-bold text-main">
                  상세주소 (선택)
                </label>
                <InputBox>
                  <input
                    id="detail-address"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="동, 호수 등 상세주소 입력"
                    className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
                    autoFocus
                  />
                </InputBox>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 border-t border-sub600 px-5 py-4">
            <button
              type="button"
              onClick={() => setSelectedAddress(null)}
              className="typo-body-sm-medium flex-1 rounded-xl border border-sub600 bg-card py-3 text-main"
            >
              다시 검색
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="typo-body-sm-bold flex-1 rounded-xl bg-dark py-3 text-white"
            >
              완료
            </button>
          </div>
        </>
      )}
    </div>
  );
}
