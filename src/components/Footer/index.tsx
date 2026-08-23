import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import styles from './Footer.module.css';
import { VisitorCounter } from '@/components/VisitorCounter';
import { DEFAULT_FOOTER } from '@/lib/defaults';

export const Footer = async () => {
  // ── Fallback mặc định từ dữ liệu local ────────────────────────────────────
  let aboutText = DEFAULT_FOOTER.aboutText;
  let addressMain = DEFAULT_FOOTER.addressMain;
  let addressSub = DEFAULT_FOOTER.addressSub;
  let phone = DEFAULT_FOOTER.phone;
  let email = DEFAULT_FOOTER.email;
  let copyrightText = DEFAULT_FOOTER.copyrightText;
  let designerCredit = DEFAULT_FOOTER.designerCredit;
  let globalFooter: any = {
    quickLinks: DEFAULT_FOOTER.quickLinks,
    socialLinks: DEFAULT_FOOTER.socialLinks,
  };

  // ── Ghi đè bằng dữ liệu DB nếu có ────────────────────────────────────────
  try {
    const payload = await getPayload({ config: configPromise });
    const s = await payload.findGlobal({ slug: 'site-settings' }) as any;
    const dbFooter = s?.footer || {};

    if (dbFooter.aboutText) aboutText = dbFooter.aboutText;
    if (dbFooter.addressMain) addressMain = dbFooter.addressMain;
    addressSub = dbFooter.addressSub || '';
    if (dbFooter.phone) phone = dbFooter.phone;
    if (dbFooter.email) email = dbFooter.email;

    const currentYear = new Date().getFullYear().toString();
    if (dbFooter.copyrightText) {
      copyrightText = dbFooter.copyrightText.replace('{year}', currentYear);
    }
    if (dbFooter.designerCredit) {
      designerCredit = dbFooter.designerCredit;
    }

    // Merge quickLinks & socialLinks từ DB nếu có
    if (dbFooter.quickLinks && dbFooter.quickLinks.length > 0) {
      globalFooter.quickLinks = dbFooter.quickLinks;
    }
    if (dbFooter.socialLinks && dbFooter.socialLinks.length > 0) {
      globalFooter.socialLinks = dbFooter.socialLinks;
    }
  } catch (e) {
    // DB unavailable — dùng fallback mặc định
    console.warn('Footer: using default fallback data');
  }

  return (
    <footer className={styles.footer}>
      {/* Accent color bar on top */}
      <div className={styles.topAccent} />

      <div className="container">
        <div className={styles.inner}>

          {/* Column 1: Thông tin tổ chức */}
          <div className={styles.col}>
            <h3>Về chúng tôi</h3>
            <p className={styles.orgName}>{aboutText}</p>
            <ul className={styles.contactList}>
              <li>
                <MapPin size={13} />
                <span><strong>Trụ sở chính:</strong> {addressMain}</span>
              </li>
              {addressSub && (
                <li>
                  <MapPin size={13} />
                  <span><strong>Cơ sở 2:</strong> {addressSub}</span>
                </li>
              )}
              <li>
                <Phone size={13} />
                <span>{phone}</span>
              </li>
              <li>
                <Mail size={13} />
                <span>{email}</span>
              </li>
            </ul>
            <VisitorCounter />
          </div>

          {/* Column 2: Liên kết nhanh */}
          <div className={styles.col}>
            <h3>Liên kết nhanh</h3>
            <ul className={styles.quickLinks}>
              {(globalFooter.quickLinks as any[]).map((link: any) => (
                <li key={link.id || link.url}>
                  <Link href={link.url}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Mạng xã hội */}
          <div className={styles.col}>
            <h3>Kết nối với chúng tôi</h3>
            <div className={styles.socialList}>
              {globalFooter.socialLinks && (globalFooter.socialLinks as any[]).length > 0 ? (
                (globalFooter.socialLinks as any[]).map((link: any) => {
                  let Icon = Globe;
                  if (link.platform === 'facebook') Icon = FaFacebook;
                  else if (link.platform === 'youtube') Icon = FaYoutube;
                  else if (link.platform === 'tiktok') Icon = FaTiktok;

                  return (
                    <Link key={link.id || link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                      <span className={styles.socialItemIcon}>
                        <Icon size={16} />
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Chưa có kênh mạng xã hội nào.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      <hr className={styles.divider} />

      {/* Copyright bar */}
      <div className={styles.copyright}>
        <div className={`container ${styles.copyrightInner}`}>
          <span>{copyrightText}</span>
          <span>{designerCredit}</span>
        </div>
      </div>
    </footer>
  );
};
