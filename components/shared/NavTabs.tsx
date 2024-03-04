'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import { Tabs } from 'devextreme-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
    text: 'Production Lists',
    icon: 'bulletlist',
    href: '/production',
    visible: false,
    admin: false,
  },
];
const NavTabs = () => {
  const { user, isLoaded } = useUser();
  const [showNav, setShowNav] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    router.push(e.itemData.href);
  };
  useEffect(() => {
    if (isLoaded && user) {
      if (user.organizationMemberships.length > 0) {
        if (user.organizationMemberships[0].role === 'org:admin') {
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
  }, [user, isLoaded, pathname]);
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
        <UserButton />
      </div>
    </div>
  ) : (
    isLoaded && user && (
      <div className="flex w-full p-3 justify-end">
        <UserButton />
      </div>
    )
  );
};

export default NavTabs;
