import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { accountSections } from './accountSections';
import type { AccountSectionId } from './accountSections';
import { useAccountUser } from './useAccountUser';
import { AccountNav } from './AccountNav';
import { PersonalDataSection } from './PersonalDataSection';
import { OrdersSection } from './OrdersSection';
import { CustomerSportsSection } from './CustomerSportsSection';
import { MembershipSection } from './MembershipSection';
import { CartSection } from './CartSection';
import { AdminUsersSection } from './AdminUsersSection';
import { AdminProductsSection } from './AdminProductsSection';
import './AccountPage.css';

export const AccountPage = () => {
  const { token, estaAutenticado } = useAuth();
  const { usuario, cargando, error } = useAccountUser();
  const [activeSection, setActiveSection] = useState<AccountSectionId>('personal');

  const visibleSections = useMemo(
    () => usuario ? accountSections.filter((section) => section.visible(usuario)) : [],
    [usuario]
  );

  const activeSectionExists = visibleSections.some((section) => section.id === activeSection);
  const sectionToRender = activeSectionExists ? activeSection : visibleSections[0]?.id;

  if (!estaAutenticado) {
    return (
      <section className='account-page account-page--empty'>
        <h1>Mi cuenta</h1>
        <p>Tenés que iniciar sesión para ver tu panel.</p>
        <Link className='account-link' to='/'>Volver al inicio</Link>
      </section>
    );
  }

  if (cargando && !usuario) {
    return (
      <section className='account-page account-page--empty'>
        <h1>Mi cuenta</h1>
        <p>Cargando datos del usuario...</p>
      </section>
    );
  }

  if (!usuario) {
    return (
      <section className='account-page account-page--empty'>
        <h1>Mi cuenta</h1>
        <p>No se pudo cargar el usuario.</p>
        {error && <p className='account-error'>{error}</p>}
      </section>
    );
  }

  const esAdmin = usuario.role === 'admin';

  return (
    <section className='account-page'>
      <header className='account-hero'>
        <p className='account-hero__eyebrow'>Panel de usuario</p>
        <h1>{usuario.profile?.firstName ? `${usuario.profile.firstName} ${usuario.profile?.lastName ?? ''}` : usuario.username}</h1>
        <p>
          {esAdmin
            ? 'Modo administrador: podés ver y gestionar todas las secciones.'
            : 'Panel personal: las secciones administrativas están bloqueadas.'}
        </p>
        {error && <p className='account-error'>{error}</p>}
      </header>

      <div className='account-layout'>
        <AccountNav
          sections={visibleSections}
          activeSection={sectionToRender}
          onSectionChange={setActiveSection}
        />

        <div className='account-content'>
          {sectionToRender === 'personal' && token && <PersonalDataSection token={token} usuario={usuario} />}
          {sectionToRender === 'orders' && token && <OrdersSection token={token} usuario={usuario} />}
          {sectionToRender === 'customer-sports' && token && <CustomerSportsSection token={token} usuario={usuario} />}
          {sectionToRender === 'membership' && token && <MembershipSection token={token} usuario={usuario} />}
          {sectionToRender === 'cart' && <CartSection />}
          {sectionToRender === 'admin-users' && token && esAdmin && <AdminUsersSection token={token} />}
          {sectionToRender === 'admin-products' && token && esAdmin && <AdminProductsSection token={token} />}
        </div>
      </div>
    </section>
  );
};
