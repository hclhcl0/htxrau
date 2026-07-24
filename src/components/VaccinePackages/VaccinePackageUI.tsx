"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, ChevronRight, Shield, Clock, Package, ChevronDown } from "lucide-react";

interface VaccineItem {
  id: string;
  vaccine: { id?: string; name: string; origin?: string; disease?: string; price?: number; scheduleDoses?: number };
  diseaseName?: string;
  doses: number;
  protocol?: string;
  unitPrice?: number;
  originalUnitPrice?: number;
}

interface VaccinePackage {
  id: string;
  name: string;
  targetGroup: string;
  packageType: string;
  image?: { url: string };
  description?: string;
  originalPrice?: number;
  discountPrice: number;
  discountLabel?: string;
  items: VaccineItem[];
  isFeatured?: boolean;
}

interface Props {
  packages: VaccinePackage[];
  vaccines?: any[];
  phoneNumber: string;
  compact?: boolean;
}

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function VaccinePackageUI({ packages, vaccines = [], phoneNumber, compact = false }: Props) {
  const featured = packages.find((p) => p.isFeatured) || packages[0];
  const [selected, setSelected] = useState<VaccinePackage | null>(featured || null);
  const [customDoses, setCustomDoses] = useState<Record<number, number>>({});
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, any>>({});

  useEffect(() => {
    setCustomDoses({});
    setSelectedAlternatives({});
  }, [selected?.id]);

  const handleDoseChange = (idx: number, delta: number, originalDoses: number, maxDoses?: number) => {
    const current = customDoses[idx] !== undefined ? customDoses[idx] : originalDoses;
    let newVal = Math.max(0, current + delta);
    if (maxDoses != null && newVal > maxDoses) newVal = maxDoses;
    setCustomDoses(prev => ({ ...prev, [idx]: newVal }));
  };

  const getDynamicPrice = () => {
    if (!selected) return 0;
    let total = selected.discountPrice;
    selected.items?.forEach((item, idx) => {
      const maxDoses = item.vaccine?.scheduleDoses ?? undefined;
      const originalQty = maxDoses != null ? Math.min(item.doses || 1, maxDoses) : (item.doses || 1);
      const currentQty = customDoses[idx] !== undefined ? customDoses[idx] : originalQty;
      const alt = selectedAlternatives[idx];
      total -= originalQty * (item.unitPrice || 0);
      const newPrice = alt ? alt.price : (item.unitPrice || 0);
      total += currentQty * newPrice;
    });
    return Math.max(0, total);
  };

  const byAge = packages.filter((p) => p.packageType === "by_age");
  const byTarget = packages.filter((p) => p.packageType === "by_target");

  const PackageCard = ({ pkg }: { pkg: VaccinePackage }) => {
    const isActive = selected?.id === pkg.id;
    return (
      <button
        onClick={() => setSelected(isActive ? null : pkg)}
        className={`w-full flex items-stretch pr-3 border text-left transition-all duration-200 cursor-pointer relative ${isActive ? "rounded-t-2xl lg:rounded-2xl z-10" : "rounded-2xl z-10"}
          ${isActive
            ? "border-[#00a4ff] bg-white shadow-sm"
            : "border-gray-100 bg-white hover:border-[#00a4ff]/40 hover:bg-gray-50"
          }`}
      >
        {/* External Triangle (Desktop) */}
        {isActive && (
          <div className="hidden lg:block absolute top-1/2 -right-[1px] translate-x-full -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#00a4ff] z-20" />
        )}
        
        {/* Thumbnail */}
        <div className="w-20 relative flex-shrink-0 bg-white border-r border-gray-200/50 mr-3 flex items-center justify-center rounded-l-[15px] overflow-hidden">
          {pkg.image?.url || pkg.image?.filename ? (
            <img
              src={pkg.image.url || `/api/media/file/${pkg.image.filename}`}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">💉</div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 py-3 flex flex-col justify-center">
          <p className={`font-medium uppercase text-[13px] leading-tight ${isActive ? "text-[#00a4ff]" : "text-gray-800"}`}>
            {pkg.name}
          </p>
        </div>
        {/* Mobile Arrow */}
        <div className="lg:hidden flex items-center pr-1 ml-1">
          {isActive ? (
            <ChevronDown size={18} className="text-[#00a4ff]" />
          ) : (
            <ChevronRight size={18} className="text-gray-300" />
          )}
        </div>
      </button>
    );
  };


  const renderDetailPanel = (isMobile: boolean = false) => {
    if (!selected) {
      if (isMobile) return null;
      return (
        <div className="hidden lg:flex flex-1 lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0 items-center justify-center bg-gray-50/30">
          <div className="text-center opacity-60 pointer-events-none">
            <div className="text-5xl mb-4">💉</div>
            <p className="text-gray-500 font-medium text-[15px]">Vui lòng chọn một gói vắc xin<br/>để xem chi tiết</p>
          </div>
        </div>
      );
    }
    return (
      <div className={`flex flex-col bg-white overflow-hidden ${isMobile ? 'lg:hidden mt-0 rounded-b-2xl border-x border-b border-[#00a4ff]/30 shadow-[0_10px_20px_-10px_rgba(0,164,255,0.15)] z-0 relative' : 'hidden lg:flex flex-1 lg:absolute lg:top-0 lg:bottom-0 lg:left-72 xl:left-80 lg:right-0'}`}>

            {/* Header */}
            <div className={`bg-[#00a4ff]/5 px-6 min-h-[56px] items-center justify-center border-b border-[#00a4ff]/10 relative z-10 overflow-hidden ${isMobile ? 'hidden' : 'flex'}`}>
              {/* Decorative transparent background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2300a4ff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
              
              {/* Decorative Watermark Icon */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
                <Shield size={100} strokeWidth={1.5} />
              </div>

              <h2 className="relative m-0 p-0 flex items-center justify-center gap-2 text-[18px] md:text-[20px] font-bold text-[#00a4ff] uppercase tracking-wide">
                <Shield size={22} className="opacity-80" />
                <span className="mb-[2px]">{selected?.name}</span>
              </h2>
            </div>

            {/* Table header */}
            {selected?.items && selected.items.length > 0 && (
              <div className="px-6 py-3 grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-dashed border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#00a4ff] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-gray-700">Vắc xin</span>
                </div>
                <div className="flex items-center gap-1 hidden md:flex justify-center">
                  <span className="text-[13px] font-medium text-gray-700">Phác đồ</span>
                  <span className="text-gray-400 text-[10px] border border-gray-300 rounded-full w-3.5 h-3.5 flex items-center justify-center">i</span>
                </div>
                <span className="text-[13px] font-medium text-gray-700 hidden md:block text-center">Số lượng</span>
                <span className="text-[13px] font-medium text-gray-700 text-right">Đơn giá</span>
              </div>
            )}

            {/* Vaccine items */}
            <div className={`px-6 divide-y divide-dashed divide-gray-200 overflow-y-auto custom-scrollbar ${compact ? 'max-h-[280px]' : 'flex-1'}`}>
              {selected?.items?.map((item, idx) => (
                <div key={idx} className="py-2.5">
                  <div className="text-[14px] font-medium text-[#00a4ff] mb-1.5 flex items-center gap-2">
                    {(() => {
                      const maxDoses = item.vaccine?.scheduleDoses ?? undefined;
                      const originalQty = maxDoses != null ? Math.min(item.doses || 1, maxDoses) : (item.doses || 1);
                      const currentQty = customDoses[idx] !== undefined ? customDoses[idx] : originalQty;
                      const isChecked = currentQty > 0;
                      
                      return (
                        <button 
                          onClick={() => {
                            if (isChecked) {
                              setCustomDoses(prev => ({ ...prev, [idx]: 0 }));
                            } else {
                              setCustomDoses(prev => ({ ...prev, [idx]: originalQty }));
                            }
                          }}
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${isChecked ? 'bg-[#00a4ff]' : 'bg-gray-200 border border-gray-300'}`}
                        >
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      );
                    })()}
                    <span className={customDoses[idx] === 0 ? 'text-gray-400 line-through' : ''}>{item.diseaseName || 'Nhiều nguyên nhân'}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_120px] gap-3 items-center">
                    {/* Vaccine dropdown / display */}
                    <div className="flex-1">
                      {(() => {
                        const disease = item.vaccine?.disease;
                        const alts = disease ? vaccines.filter((v: any) => v.disease === disease && v.status === 'in_stock') : [];
                        const isDropdown = alts.length > 1;
                        return isDropdown ? (
                          <div className="relative border border-gray-200 rounded-lg bg-white hover:border-[#00a4ff] transition-colors cursor-pointer">
                            <select
                              className="w-full appearance-none bg-transparent py-1.5 pl-3 pr-8 text-[13px] font-medium text-gray-700 uppercase truncate cursor-pointer focus:outline-none"
                              value={String(selectedAlternatives[idx]?.id || item.vaccine?.id || '')}
                              onChange={(e) => {
                                const match = alts.find((a: any) => String(a.id) === String(e.target.value));
                                if (match && String(match.id) !== String(item.vaccine?.id)) {
                                  setSelectedAlternatives(prev => ({ ...prev, [idx]: match }));
                                } else {
                                  const newObj = { ...selectedAlternatives };
                                  delete newObj[idx];
                                  setSelectedAlternatives(newObj);
                                }
                              }}
                            >
                              <option value={String(item.vaccine?.id || '')}>{item.vaccine?.origin ? `${item.vaccine.origin} - ` : ''}{item.vaccine?.name}</option>
                              {alts.filter((a: any) => String(a.id) !== String(item.vaccine?.id)).map((alt: any) => (
                                <option key={alt.id} value={String(alt.id)}>{alt.origin ? `${alt.origin} - ` : ''}{alt.name}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <ChevronDown size={16} className="text-gray-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg px-3 py-1.5 flex items-center bg-gray-50">
                            <div className="flex items-center gap-2 overflow-hidden w-full">
                              <span className="text-[13px] font-medium text-gray-700 uppercase truncate">
                                {item.vaccine?.origin ? `${item.vaccine.origin} - ` : ''}{item.vaccine?.name}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Protocol */}
                    <p className="text-[13px] text-gray-600 hidden md:block text-center">
                      {item.protocol || `${item.vaccine?.scheduleDoses != null ? Math.min(item.doses || 1, item.vaccine.scheduleDoses) : (item.doses || 1)} Liều`}
                    </p>
                    {/* Quantity */}
                    <div className="hidden md:flex justify-center">
                      {(() => {
                        const maxDoses = item.vaccine?.scheduleDoses ?? undefined;
                        const originalQty = maxDoses != null ? Math.min(item.doses || 1, maxDoses) : (item.doses || 1);
                        const currentQty2 = customDoses[idx] !== undefined ? customDoses[idx] : originalQty;
                        const atMax = maxDoses != null && currentQty2 >= maxDoses;
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => handleDoseChange(idx, -1, originalQty, maxDoses)}
                                className="px-2.5 py-1 text-gray-400 hover:bg-gray-50 transition-colors"
                              >—</button>
                              <span className="px-3 text-[13px] font-medium text-gray-700 border-x border-gray-100">
                                {currentQty2}
                              </span>
                              <button
                                onClick={() => handleDoseChange(idx, 1, originalQty, maxDoses)}
                                disabled={atMax}
                                title={atMax ? `Tối đa ${maxDoses} liều theo phác đồ` : undefined}
                                className={`px-2.5 py-1 transition-colors ${
                                  atMax
                                    ? 'text-gray-200 cursor-not-allowed bg-gray-50'
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                              >+</button>
                            </div>
                            {maxDoses != null && (
                              <span className="text-[10px] text-gray-400">tối đa {maxDoses} liều</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      {(() => {
                        const alt = selectedAlternatives[idx];
                        const displayPrice = alt ? alt.price : item.unitPrice;
                        return displayPrice ? (
                          <p className="text-[14px] font-medium text-gray-800">{formatPrice(displayPrice)}</p>
                        ) : (
                          <p className="text-sm text-gray-400">—</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-gray-100 px-6 py-5 bg-white">
              <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                {/* CTA buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 text-[#00a4ff] font-semibold text-[13px] px-6 py-1.5 rounded-full border border-[#00a4ff]/40 bg-white hover:bg-[#00a4ff] hover:text-white transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><circle cx="8" cy="15" r="1.5"></circle><circle cx="12" cy="15" r="1.5"></circle><circle cx="16" cy="15" r="1.5"></circle></svg>
                    Đặt hẹn tiêm
                  </a>
                  {!compact && (
                    <a
                      href="/goi-vac-xin"
                      className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 border border-[#00a4ff] text-[#00a4ff] hover:bg-[#00a4ff] hover:text-white font-bold px-5 py-2.5 rounded-full transition-colors text-[15px]"
                    >
                      Xem chi tiết gói
                      <ChevronRight size={16} />
                    </a>
                  )}
                </div>

                {/* Total price */}
                <div className="text-right flex-shrink-0 flex flex-col items-end">
                  <p className="text-[22px] leading-none font-bold text-gray-800">
                    {selected ? formatPrice(getDynamicPrice()) : ''}
                  </p>
                </div>
              </div>

              {/* Note */}
              {compact ? (
                <div className="mt-4">
                  <a
                    href="/goi-vac-xin"
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#00a4ff] font-semibold hover:underline underline-offset-4"
                  >
                    Xem đầy đủ chi tiết gói &amp; tùy chỉnh liều tại trang vắc xin
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              ) : (
                <div className="mt-6 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[14px] mt-0.5 flex-shrink-0">💡</span>
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      Quý khách có thể bỏ chọn các Liều đã tiêm để tùy chỉnh gói tiêm phù hợp với nhu cầu.
                    </p>
                  </div>
                </div>
              )}
            </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {packages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">💉</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Chưa có gói vắc xin nào</h2>
          <p className="text-gray-500 text-sm mb-6">Vui lòng thêm gói vắc xin trong trang quản trị CMS.</p>
          <a href={`tel:${phoneNumber}`}
            className="inline-flex items-center gap-2 bg-[#00a4ff] text-white font-bold px-6 py-3 rounded-xl">
            <Phone size={17} />
            Gọi tư vấn: {phoneNumber}
          </a>
        </div>
      ) : (
        <div className={`bg-white rounded-3xl border border-[#00a4ff]/40 shadow-[0_20px_60px_-15px_rgba(0,164,255,0.4)] ring-4 ring-[#00a4ff]/20 overflow-hidden relative flex flex-col lg:block ${compact ? '' : 'lg:min-h-[500px]'}`}>
          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 lg:border-r border-[#00a4ff]/10 bg-gradient-to-b from-[#f0f8f9] to-white flex flex-col relative z-10">
            <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-[500px] lg:max-h-none">
              {packages.map((pkg) => {
                const isActive = selected?.id === pkg.id;
                return (
                  <div key={pkg.id} className="flex flex-col relative z-10">
                    <PackageCard pkg={pkg} />
                    {isActive && renderDetailPanel(true)}
                  </div>
                );
              })}
            </div>
              {/* Mobile View All Link */}
              {compact && (
                <div className="p-3 lg:hidden flex justify-center border-t border-[#00a4ff]/10 bg-[#f0f8f9]/50">
                  <a href="/goi-vac-xin" className="inline-flex items-center gap-1 text-[#00a4ff] font-semibold text-[13px] px-4 py-1.5 rounded-full border border-[#00a4ff]/40 bg-white hover:bg-[#00a4ff] hover:text-white transition-all">
                    Xem tất cả gói vắc xin
                    <ChevronRight size={14} />
                  </a>
                </div>
              )}
            </div>


          {/* ── Detail Panel (Desktop) ── */}
          {renderDetailPanel(false)}
        </div>
      )}
    </div>
  );
}
