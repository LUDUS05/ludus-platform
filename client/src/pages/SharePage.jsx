import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Gift, Share, Copy, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import QRCodeGenerator from "../components/onboarding/QRCodeGenerator";
import ShareButtons from "../components/onboarding/ShareButtons";

const SharePage = () => {
  const { t, i18n } = useTranslation();
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Generate referral link (mock for now)
    const baseUrl = window.location.origin;
    const mockReferralCode = "LUDUS2024";
    setReferralLink(`${baseUrl}/hi?ref=${mockReferralCode}`);
    setUserName("مستخدم LUDUS"); // Mock user name
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareText = t("referral.shareText", "انضم إلي على LUDUS - اكتشف أنشطة رائعة بالقرب منك!");

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-blue-300 p-4">
      {/* Brutalist Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-black transform rotate-12"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-black transform -rotate-12"></div>
        <div className="absolute bottom-20 left-32 w-28 h-28 bg-black transform rotate-45"></div>
        <div className="absolute bottom-32 right-10 w-20 h-20 bg-black transform -rotate-45"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 mx-auto mb-8 bg-white brutalist-border brutalist-shadow flex items-center justify-center transform rotate-3">
            <Gift className="w-16 h-16 text-black" />
          </div>
          <h1 className="text-4xl md:text-6xl brutalist-text mb-4 text-black">
            {t("referral.title", "شارك LUDUS")}
          </h1>
          <p className="text-xl md:text-2xl text-black font-bold max-w-2xl mx-auto">
            {t("referral.subtitle", "ادع الأصدقاء واحصل على مكافآت")}
          </p>
        </motion.div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white brutalist-border brutalist-shadow p-8 mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl brutalist-text mb-4 text-black">
            {t("referral.reward", "احصل على 5 ريال لكل صديق ينضم")}
          </h2>
          <p className="text-lg text-gray-700">
            {i18n.language === 'ar' 
              ? "كلما دعوت المزيد من الأصدقاء، كلما كسبت المزيد من المكافآت!"
              : "The more friends you invite, the more rewards you earn!"
            }
          </p>
        </motion.div>

        {/* QR Code and Link Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white brutalist-border brutalist-shadow p-8 text-center"
          >
            <h3 className="text-xl md:text-2xl brutalist-text mb-6 text-black">
              {t("referral.qrTitle", "رمز الاستجابة السريعة")}
            </h3>
            <div className="flex justify-center">
              <QRCodeGenerator url={referralLink} />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {i18n.language === 'ar' 
                ? "امسح الرمز لمشاركة LUDUS"
                : "Scan to share LUDUS"
              }
            </p>
          </motion.div>

          {/* Referral Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white brutalist-border brutalist-shadow p-8"
          >
            <h3 className="text-xl md:text-2xl brutalist-text mb-6 text-black">
              {t("referral.linkTitle", "رابط الدعوة")}
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-100 brutalist-border p-4 break-all">
                <p className="text-sm text-gray-700">{referralLink}</p>
              </div>
              <Button
                onClick={copyToClipboard}
                className="w-full bg-black hover:bg-gray-800 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {t("referral.copiedText", "تم النسخ!")}
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    {t("referral.copyBtn", "نسخ الرابط")}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white brutalist-border brutalist-shadow p-8 mb-8"
        >
          <h3 className="text-xl md:text-2xl brutalist-text mb-6 text-center text-black">
            {i18n.language === 'ar' 
              ? "شارك عبر وسائل التواصل الاجتماعي"
              : "Share on Social Media"
            }
          </h3>
          <ShareButtons 
            url={referralLink} 
            text={shareText} 
            language={i18n.language} 
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => window.location.href = '/activities'}
            className="bg-green-500 hover:bg-green-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200 flex-1 sm:flex-none"
          >
            {i18n.language === 'ar' 
              ? "اكتشف الأنشطة"
              : "EXPLORE ACTIVITIES"
            }
          </Button>
          <Button
            onClick={() => window.location.href = '/profile'}
            className="bg-blue-500 hover:bg-blue-600 brutalist-border brutalist-shadow brutalist-shadow-hover brutalist-text h-12 text-white transition-all duration-200 flex-1 sm:flex-none"
          >
            {i18n.language === 'ar' 
              ? "الملف الشخصي"
              : "VIEW PROFILE"
            }
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-600">
            {i18n.language === 'ar' 
              ? "شكراً لكونك جزءاً من مجتمع LUDUS!"
              : "Thank you for being part of the LUDUS community!"
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SharePage;
