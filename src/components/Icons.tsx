import type { ReactNode, SVGProps } from 'react';

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
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

export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon strokeWidth={2.6}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const CheckCircleIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 3 3 5-6" />
  </Icon>
);

export const ImageIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="3.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </Icon>
);

export const PaperclipIcon = () => (
  <Icon>
    <path d="M21.4 11.05 12.2 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Icon>
);

export const FolderIcon = () => (
  <Icon>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);

export const SparkleIcon = () => (
  <Icon>
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />
    <path d="M19 17v4M17 19h4" />
  </Icon>
);

export const CameraIcon = () => (
  <Icon>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-2h5.6L16 6h1.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.6" />
  </Icon>
);

export const ExternalIcon = () => (
  <Icon width="1em" height="1em">
    <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Icon>
);

export const ChevronIcon = () => (
  <Icon>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

/** The little pastel-dots mark shown next to the app name. */
export const Logo = () => (
  <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true" focusable="false">
    <circle cx="32" cy="32" r="28" fill="#7fd1c7" />
    <circle cx="24" cy="26" r="6" fill="#f5b8d2" />
    <circle cx="40" cy="23" r="5" fill="#f3e08f" />
    <circle cx="42" cy="39" r="6" fill="#cdb8f0" />
    <circle cx="25" cy="41" r="4" fill="#fff" fillOpacity=".8" />
  </svg>
);
