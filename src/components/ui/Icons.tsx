import type { SVGProps } from 'react';

// Icônes au trait, dessinées sur une grille 24×24, épaisseur 1,5 : cohérentes avec la typographie fine.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>
);
export const BagIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Icon>
);
export const TruckIcon = (p: IconProps) => (
  <Icon {...p}><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></Icon>
);
export const WalletIcon = (p: IconProps) => (
  <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 12.5h2" /><path d="M3 9h18" /></Icon>
);
export const PackageIcon = (p: IconProps) => (
  <Icon {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5" /><path d="M12 12v9" /></Icon>
);
export const SparkleIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" /></Icon>
);
export const MenuIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>
);
export const FilterIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Icon>
);
export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon>
);
export const TrashIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 7h14" /><path d="M10 7V5h4v2" /><path d="M7 7l1 13h8l1-13" /></Icon>
);
