import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { UsersIcon, BuildingOfficeIcon, CogIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  activeTab: 'employees' | 'departments' | 'workunits';
  onTabChange: (tab: 'employees' | 'departments' | 'workunits') => void;
}

function Header({ activeTab, onTabChange }: HeaderProps) {
  const navigation = [
    { name: 'Employees', key: 'employees' as const, icon: UsersIcon },
       { name: 'Work Units', key: 'workunits' as const, icon: CogIcon },
    { name: 'Departments', key: 'departments' as const, icon: BuildingOfficeIcon },

  ];

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-gray-800 via-gray-900 to-primary-900 shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-white">
                    Employee Management System
                  </h1>
                  <p className="text-sm text-gray-300 mt-1">
                    Employee, Work Unit & Department Administration
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.name}
                        onClick={() => onTabChange(item.key)}
                        className={`
                          ${isActive
                            ? 'bg-white text-primary-900 shadow-lg'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }
                          group flex items-center px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200
                        `}
                      >
                        <item.icon
                          className={`
                            ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-300'}
                            mr-2.5 h-5 w-5
                          `}
                          aria-hidden="true"
                        />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <DisclosureButton
                    key={item.name}
                    as="button"
                    onClick={() => onTabChange(item.key)}
                    className={`
                      ${isActive
                        ? 'bg-white text-primary-900'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                      group flex w-full items-center px-3 py-2 rounded-lg text-base font-medium
                    `}
                  >
                    <item.icon
                      className={`
                        ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-300'}
                        mr-3 h-5 w-5
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </DisclosureButton>
                );
              })}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default Header;