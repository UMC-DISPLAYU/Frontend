import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { MyArtworkQuestionDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { useMyArtworkQuestions } from '@/hooks/queries/useMyArtworkQuestions';

interface QuestionCardProps {
  question: MyArtworkQuestionDto;
  onClick?: () => void;
}

function QuestionCard({ question, onClick }: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <article
      onClick={onClick}
      className={`w-full rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] ${
        onClick ? 'cursor-pointer hover:bg-box transition-colors' : ''
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="typo-body-sm-semibold text-link">{question.artworkName}</h3>
          <p className="line-clamp-2 typo-body-sm-regular text-main">{question.content}</p>
        </div>

        <div className="flex items-center justify-between typo-body-xs-regular text-faint">
          <span>{formatDate(question.createdAt)}</span>
          <span>{question.answerStatus === 'WAITING' ? '답변대기' : '답변완료'}</span>
        </div>
      </div>
    </article>
  );
}

export function MyQuestionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useMyArtworkQuestions({ size: 10 });

  const questions = data?.questions ?? [];

  return (
    <div className="max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">내가 한 질문</h1>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col">
        {isLoading ? (
          <LoadingView fullScreen={false} />
        ) : isError ? (
          <ErrorView fullScreen={false} message="질문을 불러오는 데 실패했습니다." />
        ) : questions.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {questions.map((question, i) => {
              const handleNavigation = () => {
                if (question.artworkId) {
                  navigate(`/artwork/${question.artworkId}`);
                } else if (question.personalArtworkId) {
                  navigate(`/personal-artworks/${question.personalArtworkId}`);
                }
              };

              return <QuestionCard key={i} question={question} onClick={handleNavigation} />;
            })}
          </div>
        ) : (
          <ErrorView fullScreen={false} message="등록된 질문이 없습니다." />
        )}
      </section>
    </div>
  );
}
