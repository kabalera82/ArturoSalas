import type { AccountSectionId, AccountSectionItem } from './accountSections';

interface AccountNavProps {
  sections: AccountSectionItem[];
  activeSection: AccountSectionId;
  onSectionChange: (section: AccountSectionId) => void;
}

export const AccountNav = ({ sections, activeSection, onSectionChange }: AccountNavProps) => (
  <nav className='account-nav' aria-label='Secciones de cuenta'>
    {sections.map((section) => (
      <button
        key={section.id}
        className={`account-nav__item${section.id === activeSection ? ' active' : ''}`}
        type='button'
        onClick={() => onSectionChange(section.id)}
      >
        {section.label}
      </button>
    ))}
  </nav>
);
