'use client';
import { useSession } from '@/providers/SessionProvider';
import { Tabs } from 'devextreme-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SignOutBtn from '../auth/SignOutBtn';
import { UserMenu } from '../ui/userMenu';

export const navLinks = [
  {
    id: 0,
    text: 'Instructions',
    icon: 'home',
    href: '/',
    visible: false,
    admin: false,
  },
  {
    id: 1,
    text: 'Inventory',
    icon: 'chart',
    href: '/inventory',
    visible: false,
    admin: true,
  },
  {
    id: 2,
    text: 'Products',
    icon: 'ordersbox',
    href: '/product',
    visible: false,
    admin: true,
  },
  {
    id: 3,
    text: 'Categories',
    icon: 'contentlayout',
    href: '/category',
    visible: false,
    admin: true,
  },
  {
    id: 4,
    text: 'Production Lists',
    icon: 'bulletlist',
    href: '/production',
    visible: false,
    admin: false,
  },
  {
    id: 5,
    text: 'Production History',
    icon: 'dataarea',
    href: '/history',
    visible: false,
    admin: true,
  },
];
const NavTabs = () => {
  const { user } = useSession();
  const [showNav, setShowNav] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    router.push(e.itemData.href);
  };
  useEffect(() => {
    if (user) {
      if (user.role.length > 0) {
        if (user.role === 'admin') {
          setShowNav(true);

          navLinks.forEach((element) => {
            element.visible = true;
            if (pathname?.startsWith(element.href)) {
              setSelectedIndex(element.id);
            }
          });
        } else {
          setShowNav(true);
          navLinks.forEach((element) => {
            if (!element.admin) element.visible = true;
            if (pathname?.startsWith(element.href)) {
              setSelectedIndex(element.id);
            }
          });
        }
      }
    } else setShowNav(false);
  }, [user, pathname]);
  return showNav ? (
    <div className="flex items-center">
      {navLinks.filter((tab) => tab.visible !== false).length !== 0 && (
        <Tabs
          id="withIconAndText"
          width="100%"
          visible={showNav}
          selectedItem={navLinks.find((x) => x.id === selectedIndex)}
          dataSource={navLinks.filter((tab) => tab.visible !== false)}
          scrollByContent={false}
          showNavButtons={false}
          orientation="horizontal"
          stylingMode="secondary"
          iconPosition="top"
          onItemClick={handleClick}
        />
      )}
      <div className="flex p-3 justify-end">
        <UserMenu />
      </div>
    </div>
  ) : (
    user && (
      <div className="flex w-full p-3 justify-end">
        <UserMenu />
      </div>
    )
  );
};

export default NavTabs;
