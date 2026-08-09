import { SchoolSearchInput } from './SchoolSearchInput';

interface AffiliationInputProps {
  group: 'institution' | 'organization';
  school: string;
  onSchoolChange: (school: string) => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  readonly?: boolean;
  isDepartmentRequired?: boolean;
}

export function AffiliationInput({
  group,
  school,
  onSchoolChange,
  department,
  onDepartmentChange,
  readonly = false,
  isDepartmentRequired = true,
}: AffiliationInputProps) {
  if (group === 'institution') {
    return (
      <div className={`bg-neutral-50 rounded-2xl ${readonly ? 'overflow-hidden' : ''}`}>
        <SchoolSearchInput value={school} onChange={onSchoolChange} readonly={readonly} />

        <div className="px-4 py-3.5 flex flex-col gap-2">
          <label htmlFor="department-input" className="flex items-center gap-1">
            <span className="text-sub700 typo-body-xs-bold leading-4">세부소속</span>
            {isDepartmentRequired && (
              <span className="text-red-400 typo-body-xs-regular leading-5">*</span>
            )}
          </label>
          <input
            id="department-input"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            placeholder="학과, 학회, 동아리명을 입력해주세요"
            className="h-10 px-3 bg-input-soft-bg rounded-2xl outline -outline-offset-1 outline-input-soft-border typo-body-sm-regular text-main placeholder:text-hint focus:outline-input-soft-border"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-neutral-50 rounded-2xl ${readonly ? 'overflow-hidden' : ''}`}>
      <div className="px-4 py-3.5 flex flex-col gap-2">
        <label htmlFor="organizer-input" className="flex items-center gap-1">
          <span className="text-dark typo-body-xs-bold leading-4">주최 / 소속명</span>
          <span className="text-red-400 typo-body-xs-regular leading-5">*</span>
        </label>
        <input
          id="organizer-input"
          value={school}
          onChange={(e) => onSchoolChange(e.target.value)}
          placeholder="팀, 모임, 연합명을 입력해주세요"
          className="h-10 px-3 bg-input-soft-bg rounded-2xl outline -outline-offset-1 outline-input-soft-border typo-body-sm-regular text-main placeholder:text-hint focus:outline-input-soft-border"
        />
      </div>
    </div>
  );
}
