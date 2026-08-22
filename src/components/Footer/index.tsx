import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { FaFacebook, FaYoutube, FaTiktok } from 'react-icons/fa';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import styles from './Footer.module.css';
import { VisitorCounter } from '@/components/VisitorCounter';

export const Footer = async () => {
  let aboutText = 'Trang trại Nông sản Sạch & Rau An Toàn VietGAP';
  let addressMain = 'Khu Nông Nghiệp Công Nghệ Cao, Hòa Vang, TP. Đà Nẵng';
  let addressSub = 'Cửa hàng phân phối: 120 Nguyễn Văn Linh, Hải Châu, TP. Đà Nẵng';
  let phone = '0905 123 456';
  let email = 'nongsanrausach@gmail.com';
  let copyrightText = `© Bản quyền thuộc về TRANG TRẠI NÔNG SẢN SẠCH & RAU AN TOÀN VIETGAP`;
  let designerCredit = 'Tươi Sạch Từ Nông Trại Đến Bàn Ăn';
  let globalFooter: any = {};

  try {
    const payload = await getPayload({ config: configPromise });
    const s = await payload.findGlobal({ slug: 'site-settings' }) as any;
    globalFooter = s?.footer || {};
    aboutText = globalFooter.aboutText || aboutText;
    addressMain = globalFooter.addressMain || addressMain;
    addressSub = globalFooter.addressSub || '';
    phone = globalFooter.phone || phone;
    email = globalFooter.email || email;
    const currentYear = new Date().getFullYear().toString();
    const rawCopyright = globalFooter.copyrightText && !globalFooter.copyrightText.includes('TRUNG TÂM KIỂM SOÁT')
      ? globalFooter.copyrightText
      : copyrightText;
    copyrightText = rawCopyright.replace('{year}', currentYear);
    designerCredit = globalFooter.designerCredit && !globalFooter.designerCredit.includes('CDC Đà Nẵng')
      ? globalFooter.designerCredit
      : designerCredit;
  } catch (e) {
    console.error('Footer: error fetching global footer data:', e);
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
              {globalFooter.quickLinks && (globalFooter.quickLinks as any[]).length > 0 ? (
                (globalFooter.quickLinks as any[]).map((link: any) => (
                  <li key={link.id}><Link href={link.url}>{link.label}</Link></li>
                ))
              ) : (
                <>
                  <li><Link href="/">Trang chủ</Link></li>
                  <li><Link href="/san-pham">Sản phẩm rau sạch</Link></li>
                  <li><Link href="/bai-viet">Tin tức & Kiến thức</Link></li>
                  <li><Link href="/video">Video nông trại</Link></li>
                  <li><Link href="/contact">Liên hệ & Báo giá sỉ</Link></li>
                </>
              )}
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
