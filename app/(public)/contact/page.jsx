import ContactPageClient from './ContactPageClient';

export const metadata = {
  title: 'Contact Us | Intrafer',
  description: 'Get in touch with the Intrafer team. We respond within 4 hours on weekdays.',
  openGraph: {
    title: 'Contact Us | Intrafer',
    description: 'Get in touch with the Intrafer team. We respond within 4 hours on weekdays.',
    url: 'https://intrafer.in/contact',
    siteName: 'Intrafer',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
