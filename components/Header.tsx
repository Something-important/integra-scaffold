"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BuildingStorefrontIcon, ChartBarIcon, UserIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";



type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: 'Home',
    href: '/'
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <ChartBarIcon className="h-4 w-4" />
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: <BuildingStorefrontIcon className="h-4 w-4" />
  }
];

export const userMenuLinks: HeaderMenuLink[] = [];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-primary text-primary-content shadow-lg" : "hover:bg-primary/10"
              } hover:shadow-md focus:!bg-primary/20 active:!bg-primary/30 py-2 px-4 text-sm rounded-xl gap-2 flex items-center transition-all duration-200 font-medium`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};


/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100/95 backdrop-blur-sm min-h-0 shrink-0 justify-between z-20 shadow-lg border-b border-base-300 px-4 lg:px-8">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* Mobile Menu */}
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="btn btn-ghost lg:hidden hover:bg-base-200">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-300"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
            <div className="divider my-2"></div>
            <li>
              <Link href="/profile" className="flex items-center gap-2 py-2 px-4 text-sm rounded-xl hover:bg-accent/10">
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </details>

        {/* Logo */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-3 mr-8 shrink-0 group">
          <div className="flex relative w-12 h-12">
            <Image alt="Integra logo" className="cursor-pointer group-hover:scale-105 transition-transform" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Integra
            </span>
            <span className="text-sm text-base-content/60">Marketplace</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal gap-1">
          <HeaderMenuLinks />
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-2">
        <RainbowKitCustomConnectButton />

        {/* Profile Button */}
        <Link href="/profile" className="btn btn-ghost btn-circle hover:bg-accent/10 hidden lg:flex">
          <UserIcon className="h-5 w-5" />
        </Link>

        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};