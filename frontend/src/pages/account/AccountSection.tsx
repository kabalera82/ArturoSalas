import type { ReactNode } from 'react';

interface AccountSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const AccountSection = ({ title, description, children }: AccountSectionProps) => (
  <section className='account-section'>
    <div className='account-section__header'>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {children}
  </section>
);
