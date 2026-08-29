import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { GalleryItem } from '../../types';
import { SectionHeader } from '../ui/SectionHeader';
import { Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveImageUrl } from '../../lib/imageAssets';

interface GallerySectionProps {
  gallery?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery = [] }) => {
  const { t, language } = useTranslation();
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Live River Moments' : 'Foto Trenuci sa Neretve'}
            title={t('gallery_title')}
            description={t('gallery_subtitle')}
            align="center"
          />
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {gallery.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => setPreviewImage(item)}
              className="group relative rounded-2xl overflow-hidden bg-[#0E1A17] border border-[#1F332C] h-72 shadow-md transition-all duration-200 hover:border-emerald-500/40 cursor-pointer"
            >
              <img
                src={resolveImageUrl(item.image_url)}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07110F]/95 via-[#07110F]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-lg bg-[#07110F]/80 backdrop-blur-xs border border-[#1F332C] flex items-center justify-center text-emerald-400">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white leading-snug font-display">
                    {item.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with AnimatePresence */}
      <AnimatePresence>
        {previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl w-full bg-[#0E1A17] border border-[#1F332C] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={resolveImageUrl(previewImage.image_url)}
                  alt={previewImage.title}
                  className="w-full h-full object-contain max-h-[75vh]"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-[#07110F]/80 hover:bg-[#07110F] text-white border border-[#1F332C] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex items-center justify-between border-t border-[#1F332C]">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {previewImage.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
