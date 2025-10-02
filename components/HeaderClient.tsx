'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { track } from '@vercel/analytics'
import { GradientButton } from './gradient-button'
import { GenerateTestDataButton } from './generate-test-data-button'
import { UserAvatarMenu } from './user-avatar-menu'

interface Navigation {
  name: string
  href: string
}

interface HeaderClientProps {
  user: { email?: string } | null
}

const navigation: Navigation[] = [
  { name: 'Events', href: '/events' },
]

const authenticatedNavigation: Navigation[] = [
  { name: 'Invites', href: '/invites' },
]

export function HeaderClient({ user }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-pink-200/30 sticky top-0 z-50 w-full">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex flex-1">
          <div className="hidden lg:flex lg:gap-x-6">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-gray-900 border-b-2 border-pink-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            {user && authenticatedNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-gray-900 border-b-2 border-pink-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-gray-900"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </div>
        <Link
          href="/"
          className="-m-1.5 p-1.5 text-2xl font-black bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-yellow-700 transition-all duration-200"
        >
          My Viral Event ✨
        </Link>
        <div className="flex flex-1 justify-end items-center gap-3">
          {user && <GenerateTestDataButton />}
          {user && (
            <GradientButton
              href="/events/create"
              onClick={() => track('create_event_header_click')}
            >
              Create Event
            </GradientButton>
          )}
          {user ? (
            <UserAvatarMenu email={user.email as string} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
              >
                Sign In
              </Link>
              <GradientButton href="/auth/sign-up">Get Started</GradientButton>
            </div>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:text-gray-900"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <Link
              href="/"
              className="-m-1.5 p-1.5 text-xl font-black bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent"
            >
              My Viral Event ✨
            </Link>
            <div className="flex flex-1 justify-end">
              {user ? (
                <UserAvatarMenu email={user.email as string} />
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-gray-900"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            {user && authenticatedNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            {user && (
              <Link
                href="/events/create"
                onClick={() => {
                  track('create_event_header_click')
                  setMobileMenuOpen(false)
                }}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-yellow-700"
              >
                Create Event
              </Link>
            )}
            {!user && (
              <Link
                href="/auth/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-yellow-700"
              >
                Get Started
              </Link>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
