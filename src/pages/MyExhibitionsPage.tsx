import { useNavigate } from 'react-router-dom';

import { LoadingView } from '@/components/common';
import { ManageScreen } from '@/components/display-manage';
import { useHideFooter } from '@/components/layout';
import { useMyDisplays } from '@/hooks/queries/useMyDisplays';

export function MyExhibitionsPage() {
  useHideFooter();

  const navigate = useNavigate();
  const { data: myDisplays = [], isLoading } = useMyDisplays();

  if (isLoading) {
    return <LoadingView message="전시 목록을 불러오는 중..." />;
  }

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <ManageScreen
        exhibitions={myDisplays}
        onOpen={(exhibition) =>
          navigate(`/exhibition/${exhibition.id}/manage`, {
            state: { ...exhibition, displayId: Number(exhibition.id) },
          })
        }
        onBack={() => window.history.back()}
        onDone={() => navigate('/setting')}
        onDelete={() => {}}
        onEditArtistName={(ex) => navigate(`/exhibition/register/artist`, { state: ex })}
        onRegister={() => navigate('/exhibition/register')}
      />
    </div>
  );
}
