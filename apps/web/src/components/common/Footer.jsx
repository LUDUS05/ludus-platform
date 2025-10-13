import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useMenuPages from '../../hooks/useMenuPages';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { pages: footerPages, loading: pagesLoading } = useMenuPages('footer');

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/letsludus',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.988-5.367 11.988-11.988C24.005 5.367 18.638.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/letsludus',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  ];

  const businessLinks = [
    {
      name: 'Investors',
      href: 'https://investors.letsludus.com'
    },
    {
      name: 'Partners',
      href: 'https://partners.letsludus.com'
    }
  ];

  const quickLinks = [
    { name: 'Activities', href: '/activities' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About Us', href: '/about' }
  ];

  // Static support links (fallback)
  const staticSupportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  // Combine static links with dynamic pages
  const supportLinks = [
    ...staticSupportLinks,
    ...footerPages.filter(page => page.status === 'published').map(page => ({
      name: page.title?.[i18n.language] || page.title?.en || page.title?.ar || page.title,
      href: `/pages/${page.slug}`,
      isExternal: false
    }))
  ];

  return (
    <footer className="bg-charcoal dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-ludus-orange dark:text-dark-ludus-orange">
                LUDUS
              </span>
            </div>
            <p className="text-white/80 dark:text-dark-text-secondary mb-6 text-sm">
              Discover amazing local activities and connect with your community across Saudi Arabia.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 dark:bg-dark-bg-secondary rounded-full flex items-center justify-center text-white/70 dark:text-dark-text-tertiary hover:bg-ludus-orange dark:hover:bg-dark-ludus-orange hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-dark-text-primary font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white dark:text-dark-text-primary font-semibold mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name + link.href}>
                  {link.isExternal !== false ? (
                    <a
                      href={link.href}
                      className="text-white/70 dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-white/70 dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="text-white dark:text-dark-text-primary font-semibold mb-4">
              Business
            </h3>
            <ul className="space-y-2">
              {businessLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 dark:border-dark-border-secondary mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 dark:text-dark-text-tertiary text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} LUDUS Platform. All rights reserved.
            </div>
            <div className="text-white/60 dark:text-dark-text-tertiary text-sm flex items-center">
              <span>Built with love in Riyadh</span>
              <span className="ml-2 text-red-500">❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;