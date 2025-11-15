import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    category: 'General',
    question: 'What is AI Image Editor?',
    answer: 'AI Image Editor is an advanced platform that uses artificial intelligence to help you create and edit stunning images. You can either upload existing images and transform them with AI, or generate completely new images from text descriptions using cutting-edge AI technology.',
  },
  {
    category: 'General',
    question: 'Do I need to sign up to use the service?',
    answer: 'Yes, you need to create a free account to use our service. Signing up is quick and easy, and you\'ll get 25 free images per month to get started. No credit card required for the free tier.',
  },
  {
    category: 'General',
    question: 'What makes this different from other AI image generators?',
    answer: 'Our platform combines both image editing and generation in one place, offers competitive pricing, provides high-resolution outputs, includes image history management, and offers flexible pricing tiers to suit different needs from casual users to businesses.',
  },

  // Pricing & Plans
  {
    category: 'Pricing',
    question: 'What are the pricing plans?',
    answer: 'We offer four tiers: Free (25 images/month), Starter ($9.99/month - 200 images), Pro ($24.99/month - 1,000 images), and Business ($79/month - 5,000 images). All paid plans include annual billing options with a 17% discount.',
  },
  {
    category: 'Pricing',
    question: 'What happens if I exceed my monthly image limit?',
    answer: 'If you exceed your monthly limit, you can either upgrade to a higher tier or pay for additional images at overage rates: Starter ($0.10/image), Pro ($0.05/image), or Business ($0.03/image). Your limit resets at the beginning of each billing cycle.',
  },
  {
    category: 'Pricing',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your current billing period. We also offer a 30-day money-back guarantee for all paid plans.',
  },
  {
    category: 'Pricing',
    question: 'Do unused images roll over to the next month?',
    answer: 'No, unused images do not roll over. Your image limit resets at the beginning of each billing cycle. We recommend using your images before the cycle ends to maximize value.',
  },
  {
    category: 'Pricing',
    question: 'Is there a free trial for paid plans?',
    answer: 'While we don\'t offer a traditional free trial, our Free tier gives you 25 images per month to test all features. This allows you to fully experience the platform before committing to a paid plan.',
  },

  // Usage & Features
  {
    category: 'Usage',
    question: 'What image formats are supported?',
    answer: 'You can upload images in common formats like JPG, PNG, and WebP. Generated and edited images are provided in PNG format for the best quality. You can download images in their original format.',
  },
  {
    category: 'Usage',
    question: 'What are the maximum image dimensions?',
    answer: 'Image resolution depends on your plan: Free and Starter plans get up to 2048x2048 pixels, Pro plan gets up to 4096x4096 pixels, and Business plan gets the highest resolution available. All images are optimized for print-on-demand quality.',
  },
  {
    category: 'Usage',
    question: 'How long does it take to generate an image?',
    answer: 'Most images are generated within 10-30 seconds, depending on complexity and server load. Pro and Business plan users get priority processing, which typically results in faster generation times.',
  },
  {
    category: 'Usage',
    question: 'Can I edit multiple images at once?',
    answer: 'Yes! In Edit mode, you can upload multiple images and process them all with the same prompt. Each image will be edited individually according to your instructions.',
  },
  {
    category: 'Usage',
    question: 'Are there any restrictions on what I can generate?',
    answer: 'Yes, we have content policies in place. You cannot generate images that are illegal, harmful, or violate our terms of service. This includes explicit content, hate speech, or images that infringe on copyrights. We use AI safety filters to prevent inappropriate content.',
  },
  {
    category: 'Usage',
    question: 'Can I use generated images commercially?',
    answer: 'Commercial usage rights depend on your plan. Free and Starter plans are for personal use only. Pro and Business plans include commercial licenses, allowing you to use images for business purposes, marketing, products, and more.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'What AI model do you use?',
    answer: 'We use Google\'s Gemini 2.5 Flash Image model, which is one of the most advanced AI image generation and editing models available. It provides high-quality results with fast processing times.',
  },
  {
    category: 'Technical',
    question: 'Are my images stored securely?',
    answer: 'Yes, all images are stored securely in our database with encryption. Your images are private and only accessible to you through your account. You can delete images at any time from your gallery.',
  },
  {
    category: 'Technical',
    question: 'Do you offer API access?',
    answer: 'Yes, API access is available for Pro and Business plan subscribers. Pro plan includes limited API access, while Business plan includes unlimited API access with higher rate limits and dedicated support.',
  },
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience.',
  },
  {
    category: 'Technical',
    question: 'Why is my image generation failing?',
    answer: 'Image generation can fail due to several reasons: invalid or inappropriate prompts, API quota limits, network issues, or server overload. Check your prompt for policy violations, ensure you have remaining credits, and try again. If issues persist, contact support.',
  },

  // Account & Billing
  {
    category: 'Account',
    question: 'How do I change my password?',
    answer: 'You can change your password from your user profile settings. Click on your profile picture in the header, then navigate to account settings. If you\'re using Neon Auth, password changes are handled through the authentication system.',
  },
  {
    category: 'Account',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can upgrade your plan at any time and the new features will be available immediately. Downgrades take effect at the end of your current billing period. You can manage your subscription from your user portal.',
  },
  {
    category: 'Account',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and payment methods supported by Stripe, including Visa, Mastercard, American Express, and various digital payment options depending on your region.',
  },
  {
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'To delete your account, please contact our support team. Account deletion will permanently remove all your images and data. Make sure to download any images you want to keep before requesting deletion.',
  },

  // Support
  {
    category: 'Support',
    question: 'How do I contact support?',
    answer: 'You can contact our support team through email at support@example.com. Pro and Business plan users get priority support with faster response times. Free and Starter users can also reach out, though response times may be longer.',
  },
  {
    category: 'Support',
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied with the service within 30 days of your initial purchase, contact support for a full refund.',
  },
];

export const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-400">
            Find answers to common questions about our AI Image Editor
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-semibold text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-cyan-900/20 border border-cyan-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-slate-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="mailto:support@example.com" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors">
              Contact Support
            </a>
            <button
              onClick={() => window.location.href = '#howto'}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              View How to Use Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

