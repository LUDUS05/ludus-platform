import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from '../components/forms/ContactForm';
import Card from '../components/ui/Card';
import { cn } from '../utils/cn';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  Users,
  Headphones
} from 'lucide-react';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const contactMethods = [
    {
      icon: Mail,
      title: t('contact.methods.email.title', 'Email Us'),
      description: t('contact.methods.email.description', 'Send us an email anytime'),
      value: 'hi@letsludus.com',
      action: 'mailto:hi@letsludus.com',
      color: 'bg-blue-500'
    },
    {
      icon: Phone,
      title: t('contact.methods.phone.title', 'Call Us'),
      description: t('contact.methods.phone.description', 'Mon-Fri from 9am to 6pm'),
      value: '+966 50 123 4567',
      action: 'tel:+966501234567',
      color: 'bg-green-500'
    },
    {
      icon: MessageCircle,
      title: t('contact.methods.whatsapp.title', 'WhatsApp'),
      description: t('contact.methods.whatsapp.description', 'Chat with us instantly'),
      value: t('contact.methods.whatsapp.action', 'Start Chat'),
      action: 'https://wa.me/966501234567',
      color: 'bg-green-600'
    }
  ];

  const supportTopics = [
    {
      icon: Users,
      title: t('contact.support.general.title', 'General Inquiries'),
      description: t('contact.support.general.description', 'Questions about LUDUS platform')
    },
    {
      icon: Headphones,
      title: t('contact.support.technical.title', 'Technical Support'),
      description: t('contact.support.technical.description', 'Need help with your account or bookings')
    },
    {
      icon: Users,
      title: t('contact.support.partnership.title', 'Partnership'),
      description: t('contact.support.partnership.description', 'Interested in becoming a partner')
    }
  ];

  const handleFormSubmit = async (formData) => {
    // You can implement your contact form submission logic here
    // For now, we'll simulate an API call
    console.log('Contact form submitted:', formData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // You can replace this with actual API call
    // const response = await api.post('/contact', formData);
  };

  return (
    <div className="min-h-screen bg-warm-light py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-display-lg font-bold text-ludus-dark mb-6">
            {t('contact.page.title', 'Contact Us')}
          </h1>
          <p className="text-body-lg text-ludus-gray-600 max-w-2xl mx-auto">
            {t('contact.page.subtitle', 'We\'re here to help! Reach out to us with any questions, feedback, or partnership opportunities.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <h2 className="text-display-sm font-bold text-ludus-dark mb-6">
              {t('contact.methods.title', 'Get in Touch')}
            </h2>
            
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <a 
                    href={method.action}
                    className="flex items-start space-x-4 rtl:space-x-reverse group"
                    target={method.action.startsWith('http') ? '_blank' : '_self'}
                    rel={method.action.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white',
                      method.color
                    )}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-semibold text-ludus-dark group-hover:text-ludus-orange transition-colors">
                        {method.title}
                      </h3>
                      <p className="text-body-sm text-ludus-gray-600 mb-2">
                        {method.description}
                      </p>
                      <p className="text-body-sm font-medium text-ludus-orange">
                        {method.value}
                      </p>
                    </div>
                  </a>
                </Card>
              ))}
            </div>

            {/* Office Hours */}
            <Card className="p-6 mt-6">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ludus-orange flex items-center justify-center text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-ludus-dark mb-2">
                    {t('contact.hours.title', 'Office Hours')}
                  </h3>
                  <div className="space-y-1 text-body-sm text-ludus-gray-600">
                    <p>{t('contact.hours.weekdays', 'Monday - Friday: 9:00 AM - 6:00 PM')}</p>
                    <p>{t('contact.hours.saturday', 'Saturday: 10:00 AM - 4:00 PM')}</p>
                    <p>{t('contact.hours.sunday', 'Sunday: Closed')}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6 mt-6">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-ludus-dark mb-2">
                    {t('contact.location.title', 'Our Location')}
                  </h3>
                  <p className="text-body-sm text-ludus-gray-600">
                    {t('contact.location.address', 'Riyadh, Saudi Arabia')}
                  </p>
                  <p className="text-body-sm text-ludus-gray-500 mt-1">
                    {t('contact.location.note', 'We serve all major cities in KSA')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm onSubmit={handleFormSubmit} />
          </div>
        </div>

        {/* Support Topics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-ludus-dark mb-4">
              {t('contact.support.title', 'How Can We Help?')}
            </h2>
            <p className="text-body-lg text-ludus-gray-600 max-w-2xl mx-auto">
              {t('contact.support.subtitle', 'Choose the topic that best describes your inquiry for faster assistance.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportTopics.map((topic, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow duration-200">
                <div className="mx-auto w-16 h-16 rounded-full bg-ludus-orange/10 flex items-center justify-center mb-6">
                  <topic.icon className="w-8 h-8 text-ludus-orange" />
                </div>
                <h3 className="text-body-lg font-semibold text-ludus-dark mb-3">
                  {topic.title}
                </h3>
                <p className="text-body-sm text-ludus-gray-600">
                  {topic.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Link */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <h3 className="text-body-lg font-semibold text-ludus-dark mb-3">
              {t('contact.faq.title', 'Frequently Asked Questions')}
            </h3>
            <p className="text-body-sm text-ludus-gray-600 mb-6">
              {t('contact.faq.subtitle', 'Find quick answers to common questions')}
            </p>
            <a 
              href="/faq" 
              className="inline-flex items-center text-ludus-orange font-semibold hover:text-ludus-orange-dark transition-colors"
            >
              {t('contact.faq.link', 'Visit FAQ Section')}
              <svg className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;