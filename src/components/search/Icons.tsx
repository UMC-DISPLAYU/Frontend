type IconProps = {
  className?: string;
};

export function BookmarkIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6673 14L8.00065 11.3333L3.33398 14V3.33333C3.33398 2.97971 3.47446 2.64057 3.72451 2.39052C3.97456 2.14048 4.3137 2 4.66732 2H11.334C11.6876 2 12.0267 2.14048 12.2768 2.39052C12.5268 2.64057 12.6673 2.97971 12.6673 3.33333V14Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.33333"
      />
    </svg>
  );
}
