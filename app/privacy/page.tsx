'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function PrivacyPage() {
  const highlightStyle = "bg-blue-50 border-l-4 border-blue-400 px-3 pb-2 py-2 -mt-4 -mb-6 rounded";
  const faqItems = [
    {
      question: "What information do we collect?",
            answer: `<u>Personal information you disclose to us</u>

<div class="${highlightStyle}">
<strong>In Short:</strong> We collect information that you provide to us.
</div>

We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.

The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following:

Personal Information Provided by You. We collect names; phone numbers; email addresses; mailing addresses; delivery addresses; and other similar information.

Payment Data. We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by Square Up. You may find their privacy notice link(s) here: https://squareup.com/gb/en/legal/general/privacy.

All personal information that you provide to us must be true, complete and accurate, and you must notify us of any changes to such personal information.

<u>Information automatically collected</u>

<div class="${highlightStyle}">
<strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.
</div>

      We automatically collect certain information when you visit, use or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about who and when you use our Services and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.

      Like many businesses, we also collect information through cookies and similar technologies.

      The information we collect includes:
      Location Data. We collect information data such as information about your device's location, which can be either precise or imprecise. How much information we collect depends on the type of settings of the device you use to access the Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your current location (based on your IP address). You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Locations settings on your device. Note however, if you choose to opt out, you may not be able to use certain aspects of the Services.`
    },
    {
      question: "How do we use your information?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.
</div>

We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.

We use the information we collect or receive:

Fulfill and manage your orders. We may use your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.

Administer prize draws and competitions. We may use your information to administer prize draws and competitions when you elect to participate in our competitions.

To deliver and facilitate delivery of services to the user. We may use your information to provide you with the requested service.

To respond to user inquiries/offer support to users. We may use your information to respond to your inquiries and solve any potential issues you might have with the use of our Services.

For other business purposes. We may use your information for other business purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Services, products, marketing and your experience. We may use and store this information in aggregated and anonymized form so that it is not associated with individual end users and does not include personal information. We will not use identifiable personal information without your consent.`
    },
    {
      question: "Will your information be shared with anyone?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
</div>

We may process or share your data that we hold based on the following legal basis:
Consent: We may process your data if you have given us specific consent to use your personal information in a specific purpose.

Legitimate Interests: We may process your data when it is reasonably necessary to achieve our legitimate business interests.

Performance of a Contract: Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.

Legal Obligations: We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process, such as in response to a court order or a subpoena (including in response to public authorities to meet national security or law enforcement requirements).

Vital Interests: We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.

More specifically, we may need to process your data or share your personal information in the following situations:

Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.`
    },
    {
      question: "Do we use cookies and other tracking technologies?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.
</div>

We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.`
    },
    {
      question: "How long do we keep your information?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
</div>

We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than 1 year.

When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.`
    },
    {
      question: "How do we keep your information safe?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.
</div>

We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.`
    },
    {
      question: "What are your privacy rights?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> In some regions, such as the European Economic Area, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
</div>

In some regions (like the European Economic Area), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. To make such a request, please use the contact details provided below. We will consider and act upon any request in accordance with applicable data protection laws.

If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. Please note however that this will not affect the lawfulness of the processing before its withdrawal, nor will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.

If you are resident in the European Economic Area and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority. You can find their contact details here: http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm.

If you are resident in Switzerland, the contact details for the data protection authorities are available here: https://www.edoeb.admin.ch/edoeb/en/home.html.

Cookies and similar technologies: Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. To opt-out of interest-based advertising by advertisers on our Services visit http://www.aboutads.info/choices/.`
    },
    {
      question: "Controls for do-not-track features",
      answer: `Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.`
    },
    {
      question: "Do California residents have specific privacy rights?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.
</div>

California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.

If you are under 18 years of age, reside in California, and have a registered account with a Service, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below, and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g. backups, etc.).`
    },
    {
      question: "Do we make updates to this notice?",
      answer: `<div class="${highlightStyle}">
<strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.
</div>

We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.`
    },
    {
      question: "How can you contact us about this notice?",
      answer: `If you have questions or comments about this notice, you may email us at privacy@teatimecollective.com or by post to:

Teatime Collective 
St.Wilfrids Enterprise Centre
Royce Road
Manchester M15 5BJ
United Kingdom`
    }
  ]

  return (
    <div className="min-h-screen pt-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">Privacy Statement</h1>
        <div className="max-w-6xl mx-auto">
          <p className="text-lg text-center mb-8 text-gray-600">
            Last updated August 26, 2020
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <p className="text-gray-700 mb-4">
              Thank you for choosing to be part of our community at Teatime Collective ("<strong>Company</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:privacy@teatimecollective.com" className="text-blue-600 hover:underline">privacy@teatimecollective.com</a>.
            </p>
            
            <p className="text-gray-700 mb-4">
              When you visit our website http://www.teatimecollective.co.uk (the "<strong>Website</strong>"), use our Facebook application, as the case may be (the "<strong>App</strong>") and more generally, use any of our services (the "<strong>Services</strong>", which include the Website and App), we appreciate that you are trusting us with your personal information. We take your privacy very seriously. In this privacy notice, we seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it. We hope you take some time to read through it carefully, as it is important. If there are any terms in this privacy notice that you do not agree with, please discontinue use of our Services immediately.
            </p>
            
            <p className="text-gray-700 mb-4">
              This privacy notice applies to all information collected through our Services (which, as described above, includes our Website and App), as well as any related services, sales, marketing or events.
            </p>
            
            <p className="text-gray-700">
              <strong>Please read this privacy notice carefully as it will help you understand what we do with the information that we collect.</strong>
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-orange transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed whitespace-pre-line privacy-content">
                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
      
      <style jsx>{`
        .privacy-content div[class*="bg-blue-50"] + * {
          margin-top: -1rem;
        }
      `}</style>
    </div>
  )
} 