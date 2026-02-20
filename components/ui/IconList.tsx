'use client';

import { ReactNode } from 'react';

export default function IconList({
  items,
  icon,
  className = '',
}: {
  items: string[];
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`space-y-3 text-base text-gray-800 ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 leading-snug">
          {icon && <span className="mt-1 text-(--olivea-olive)">{icon}</span>}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
