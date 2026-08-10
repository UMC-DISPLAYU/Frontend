import { useState } from 'react';

import { ExhibitionHeader } from '@/components/ui';

function Underline({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 border-b border-input-border px-3 py-2.5 ${className}`}
    >
      {children}
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 mx-auto flex min-h-dvh w-full max-w-md  flex-col bg-page">
      <ExhibitionHeader title="주소 검색" onBack={handleClose} />

      <div className={`min-h-0 flex-1 flex flex-col px-5 pt-3 ${selectedAddress ? 'pb-19' : ''}`}>
        <div className="flex-1 flex flex-col min-h-0 pb-8">
          {!selectedAddress ? (
            <div className="flex-1 flex flex-col min-h-0 gap-6">
              {/* 검색 영역 */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-3">
                  <Underline className="flex-1">
                    <input
                      id="address-keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="주소를 검색해주세요"
                      className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                      autoFocus
                    />
                  </Underline>
                  <button
                    type="button"
                    onClick={searchAddress}
                    disabled={isSearching}
                    className="typo-body-xs-bold shrink-0 rounded-lg bg-card px-4 py-2.5 text-main outline outline-1 outline-offset-[-1px] outline-sub600"
                  >
                    {isSearching ? '검색중' : '검색'}
                  </button>
                </div>
                {error && <p className="typo-body-xs-regular mt-2 text-red-500">{error}</p>}
              </div>

              {/* 검색 결과 */}
              {results.length > 0 && (
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                  {results.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAddress(result)}
                      className="flex flex-col rounded-2xl outline -outline-offset-1 outline-input-soft-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-box100"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="typo-body-md-regular text-main">
                          {result.roadAddress || result.jibunAddress}
                          {result.roadAddress && result.buildingName && (
                            <span className="typo-body-xs-regular text-hint ml-1">
                              ({result.buildingName})
                            </span>
                          )}
                        </p>
                        {result.roadAddress && result.jibunAddress && (
                          <p className="typo-body-xs-regular text-hint">{result.jibunAddress}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 상세주소 입력 */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <label className="typo-body-sm-bold text-main">선택한 주소</label>
                  <div className="flex flex-col rounded-2xl outline -outline-offset-1 outline-input-soft-border bg-card px-4 py-3.5 text-left">
                    <div className="flex flex-col gap-1">
                      <p className="typo-body-md-regular text-main">
                        {selectedAddress.roadAddress || selectedAddress.jibunAddress}
                        {selectedAddress.roadAddress && selectedAddress.buildingName && (
                          <span className="typo-body-xs-regular text-hint ml-1">
                            ({selectedAddress.buildingName})
                          </span>
                        )}
                      </p>
                      {selectedAddress.roadAddress && selectedAddress.jibunAddress && (
                        <p className="typo-body-xs-regular text-hint">
                          {selectedAddress.jibunAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="detail-address" className="typo-body-sm-bold text-main">
                    상세주소 (선택)
                  </label>
                  <Underline>
                    <input
                      id="detail-address"
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      placeholder="동, 호수 등 상세주소 입력"
                      className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                      autoFocus
                    />
                  </Underline>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedAddress && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card border-t border-line z-50 flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="typo-body-sm-bold flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black text-white"
          >
            완료
          </button>
          <button
            type="button"
            onClick={() => setSelectedAddress(null)}
            className="typo-body-sm-bold h-11 shrink-0 rounded-xl bg-card px-4 text-sub700 outline outline-1 outline-offset-[-1px] outline-sub600"
          >
            다시 검색
          </button>
        </footer>
      )}
    </div>
  );
}
