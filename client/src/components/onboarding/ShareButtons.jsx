import React from "react";
import { Button } from "../ui/Button";
import { MessageCircle, Share } from "lucide-react";

export default function ShareButtons({ url, text, language, t }) {
  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LUDUS',
          text: text,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={shareViaWhatsApp}
        className="w-full bg-green-500 hover:bg-green-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        {t('onboarding.referral.whatsapp')}
      </Button>
      
      <Button
        onClick={shareViaWebShare}
        className="w-full bg-blue-500 hover:bg-blue-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200"
      >
        <Share className="w-5 h-5 mr-2" />
        {t('onboarding.referral.share')}
      </Button>
    </div>
  );
}
