# DISPLAYU FRONTEND

![DisplayU Frontend banner](./docs/images/readme/banner.png)

대학생의 전시 경험을 하나로 연결하는 플랫폼
**DisplayU의 프론트엔드 웹입니다.**

[서비스 바로가기](https://www.displayu.co.kr) · [Backend](https://github.com/UMC-DISPLAYU/Backend)

## ✨ DisplayU

DisplayU는 대학생의 전시와 작품을 발견하고, 기록하고, 소통할 수 있는 전시 플랫폼입니다.

- 전시·작품·작가 정보 탐색과 검색
- 후기·질문·감상 및 라운지 커뮤니티
- 전시·작품·작가 아카이브
- Google·Kakao OAuth 로그인과 이미지 업로드

## 🛠️ 기술 스택

### Core

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

### 상태 관리 / 데이터 통신

![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

### 스타일링 / UI

![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white)

### 라우팅

![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

### CI/CD

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

### Mocking

![MSW](https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logo=mockserviceworker&logoColor=white)

## 👥 Frontend Team

<div align="center">

| <img src="https://github.com/anjaein.png" width="120" /> | <img src="https://github.com/hyunmin1756.png" width="120" /> | <img src="https://github.com/chulee-53.png" width="120" /> | <img src="https://github.com/aram426.png" width="120" /> |
| :---: | :---: | :---: | :---: |
| **안재인** | **서현민** | **이승철** | **정아람** |
| Leader | Member | Member | Member |
| [@anjaein](https://github.com/anjaein) | [@hyunmin1756](https://github.com/hyunmin1756) | [@chulee-53](https://github.com/chulee-53) | [@aram426](https://github.com/aram426) |

</div>

## 🚀 시작하기

```bash
# 도메인으로 가기!
https://www.displayu.co.kr
```

## 📁 폴더 구조

```
src/
├── apis/          # Axios 인스턴스와 API 함수
├── assets/        # 이미지·아이콘 등 정적 리소스
├── components/    # 공용 UI 컴포넌트
├── constants/     # 상수 정의
├── hooks/         # 커스텀 훅 (TanStack Query 포함)
├── mocks/         # MSW 핸들러
├── pages/         # 라우트 단위 페이지
├── routes/        # React Router 설정
├── stores/        # Zustand 스토어
├── types/         # 공용 타입 정의
└── utils/         # 유틸 함수
```

## 📚 문서

| 문서 | 내용 |
| ---- | ---- |
| [Code Convention](https://github.com/UMC-DISPLAYU/Frontend/blob/develop/CONVENTION.md) | 전반적인 코드 컨벤션을 정리했습니다.

**Made with passion by DisplayU Frontend Team**
