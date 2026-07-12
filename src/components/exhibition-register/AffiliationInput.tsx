import { SchoolSearchInput } from './SchoolSearchInput';

interface AffiliationInputProps {
  group: 'institution' | 'organization';
  school: string;
  onSchoolChange: (school: string) => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  organizer: string;
  onOrganizerChange: (organizer: string) => void;
}

export function AffiliationInput({
  group,
  school,
  onSchoolChange,
  department,
  onDepartmentChange,
  organizer,
  onOrganizerChange,
}: AffiliationInputProps) {
  if (group === 'institution') {
    return (
      <div className="rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-300">
        <SchoolSearchInput value={school} onChange={onSchoolChange} />

        <div className="px-4 py-3.5 flex flex-col gap-2">
          <label htmlFor="department-input" className="flex items-center gap-1">
            <span className="text-neutral-600 text-xs font-bold leading-4">세부소속</span>
            <span className="text-red-400 text-xs leading-5">*</span>
          </label>
          <input
            id="department-input"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            placeholder="학과, 학회, 동아리명을 입력해주세요"
            className="h-10 px-3 bg-neutral-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm text-neutral-900 placeholder:text-stone-300 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl outline outline-1 outline-offset-[-1px] outline-zinc-300 overflow-hidden">
      <div className="px-4 py-3.5 flex flex-col gap-2">
        <label htmlFor="organizer-input" className="flex items-center gap-1">
          <span className="text-neutral-600 text-xs font-bold leading-4">주최 / 소속명</span>
          <span className="text-red-400 text-xs leading-5">*</span>
        </label>
        <input
          id="organizer-input"
          value={organizer}
          onChange={(e) => onOrganizerChange(e.target.value)}
          placeholder="주최 또는 소속명을 입력해주세요"
          className="h-10 px-3 bg-neutral-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm text-neutral-900 placeholder:text-stone-300 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />
      </div>
    </div>
  );
}
