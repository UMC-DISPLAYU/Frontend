import { BrandLanding } from '@/components/brand';

// 프로토타입에 냅바 · 푸터가 없어 Router 에서 Layout 밖(RootLayout 안)에 둔다. 로그인 없이 볼 수 있다
export function BrandPage() {
  return <BrandLanding />;
}
