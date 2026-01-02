import { SiLinkedin, SiInstagram } from "react-icons/si";
import { Globe, Mail } from "lucide-react";
import logoImage from "@assets/ChatGPT Image Aug 26, 2025, 08_08_54 PM-Photoroom_1756219770081.png";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PRIVACY_POLICY_TEXT = `PRIVACY POLICY

Sudoku Infinium
By Meta Infinium

Last Updated: December 2025
Effective Date: 4 December 2025

1. INTRODUCTION

This Privacy Policy explains how Meta Infinium (“we”, “us”, “our”) collects, uses, stores, processes, and shares information when you use Sudoku Infinium, including our mobile apps, websites, and related services (collectively, the “Services”).

We are committed to protecting your privacy and handling your data transparently and securely in accordance with:

The Information Technology Act, 2000 (India)

IT (Reasonable Security Practices and Procedures) Rules, 2011

Applicable global data protection laws (including GDPR, where relevant)

2. DATA CONTROLLER

Meta Infinium
India
📧 privacy@metainfinium.com

🌐 https://metainfinium.com

Meta Infinium is the data controller responsible for your personal data.

3. INFORMATION WE COLLECT

We may collect and process the following categories of information:

A. Identifiers

Device identifiers

Advertising IDs (Google Advertising ID / Apple IDFA)

Internal user IDs

IP address

B. Commercial Information

In-app purchases

Subscription status

Payment confirmation (payments are handled by platform providers)

C. Device Information

Device model and manufacturer

Operating system and version

App version

Language, region, time zone

Network type and approximate internet speed

D. Usage Information

App interactions

Game progress and completion data

Features used

Session duration and frequency

Interaction with ads

E. Diagnostics & Performance Data

Crash logs

App launch time

Battery and performance metrics

Error reports

F. Location Information

Country and state inferred from IP address
(We do not collect precise GPS location)

G. Media & Files (Optional)

Files or screenshots you submit to customer support

Camera or media access only when explicitly enabled by you

H. Contact & Communication Data

Name and email address (when you contact us)

Support messages

Feedback and survey responses

I. Public & Community Content

App Store reviews

Social media interactions mentioning Sudoku Infinium

4. COOKIES, SDKs & TRACKING TECHNOLOGIES

We and our partners may use:

Cookies (web)

SDKs (mobile apps)

Pixels and similar technologies

These are used to:

Operate the app

Analyze performance

Deliver ads

Prevent fraud

Improve user experience

You can manage preferences via:

In-app Privacy Preferences

Device-level settings (Android / iOS)

⚠️ We do not respond to browser “Do Not Track” signals.

5. SOURCES OF DATA

We collect data:

Directly from you

Automatically through app usage

From device/platform providers

From advertising and analytics partners

From public platforms (reviews, social media)

6. PURPOSES OF PROCESSING

We use your data for the following purposes:

A. Service Operation

App functionality

Saving progress

Sync (if enabled)

Customer support

B. Security & Fraud Prevention

Detect abuse or misuse

Prevent unauthorized access

C. Analytics & Improvement

Understand feature usage

Improve gameplay

Fix bugs

D. Marketing & Promotions

In-app promotions

Non-intrusive notifications

Advertising (personalized or contextual)

E. Legal & Compliance

Legal obligations

Enforcement of terms

Regulatory requirements

7. LEGAL BASIS FOR PROCESSING

Depending on jurisdiction, processing is based on:

Your consent

Contract performance

Legitimate business interests

Legal obligations

8. ADVERTISING & ANALYTICS
Advertising

We may show:

Personalized ads (with consent)

Contextual ads (without personalization)

You can opt-out via:

App → Settings → Privacy Preferences

Device advertising settings

Analytics

We use:

First-party analytics (internal)

Third-party analytics (with consent where required)

9. DATA SHARING

We may share data with:

A. Service Providers

Hosting

Analytics

Customer support

Advertising partners

B. Legal Authorities

When required by law or court order

C. Business Transfers

Mergers, acquisitions, restructuring

D. With Your Consent

When you explicitly request or approve sharing

We never sell personal data in violation of applicable law.

10. CROSS-BORDER DATA TRANSFERS

Your data may be processed outside India.
We ensure appropriate safeguards such as:

Contractual protections

Industry-standard security measures

11. DATA RETENTION

We retain personal data:

Only as long as necessary

For a maximum of 5 years, unless legally required longer

After this, data is:

Deleted, or

Anonymized

12. CHILDREN’S PRIVACY

Our Services are intended for users 16 years and older.

We do not knowingly collect data from children.
If you believe a child’s data was collected, contact us immediately.

13. YOUR PRIVACY RIGHTS

Depending on your jurisdiction, you may have rights to:

Access your data

Correct inaccuracies

Delete your data

Restrict processing

Withdraw consent

Object to targeted advertising

Data portability

How to Exercise Rights

Via:

App → Settings → Privacy Preferences
or
📧 privacy@metainfinium.com

We respond within 30 days.

14. SECURITY MEASURES

We implement reasonable security practices including:

Encryption

Access controls

Secure infrastructure

Regular monitoring

However, no system is 100% secure.

15. THIRD-PARTY LINKS

Our Services may link to third-party platforms.
We are not responsible for their privacy practices.

16. CHANGES TO THIS POLICY

We may update this Privacy Policy periodically.

Material changes will be notified via:

App notification

Website notice

Continued use means acceptance.

17. CONTACT US

For privacy-related queries or requests:

Meta Infinium
📧 info@metainfinium.com
📧 metainfinium@gmail.com

🌐 https://metainfinium.com`;

const EULA_TEXT = `END USER LICENSE AGREEMENT (EULA)

Sudoku Infinium
By Meta Infinium
Last Updated: 28 November 2025

1. Definitions

Company / Meta Infinium / We / Us / Our
Means Meta Infinium, an Indian technology company providing software, AI-driven products, and digital services, including Sudoku Infinium.

Sudoku Infinium / App
Means the Sudoku Infinium mobile application, web application, and all related features, services, updates, and content operated by Meta Infinium.

User / You / Your
Means any individual who accesses, installs, or uses the App or Services.

Services
Means the App, website, APIs, features, subscriptions, updates, and any related offerings provided by Meta Infinium.

Content
Includes but is not limited to puzzles, game logic, algorithms, UI/UX designs, graphics, animations, sounds, text, hints, difficulty engines, scores, leaderboards, themes, and other materials available through the App.

Device
Means any smartphone, tablet, computer, or supported electronic device owned or legally controlled by You.

Virtual Goods
Means digital items such as hints, coins, tokens, boosters, themes, achievements, or premium features available within the App.

Unacceptable Conduct
Means any unlawful, abusive, deceptive, infringing, malicious, or exploitative behavior.

2. Acceptance of Terms

By downloading, installing, accessing, or using Sudoku Infinium, You confirm that:

You have read and understood this EULA

You agree to be legally bound by it

You are at least 16 years old or have parental/guardian consent

If You do not agree, do not use the App.

3. License Grant

Meta Infinium grants You a limited, non-exclusive, non-transferable, revocable license to use Sudoku Infinium only for personal and non-commercial purposes, subject to this EULA.

The App is licensed, not sold.

4. License Restrictions

You agree that You shall not:

Copy, sell, sublicense, rent, lease, or commercially exploit the App or Content

Reverse engineer, decompile, or attempt to extract source code, algorithms, or logic

Use cheats, automation, bots, or exploits

Scrape, record, or capture gameplay or Content to create datasets

Use App Content for AI training, machine learning, data mining, or model evaluation

Interfere with security, servers, or performance

All rights not expressly granted are reserved by Meta Infinium.

5. AI & Data Usage Restriction

You may not use any part of the App, including but not limited to:

Puzzles

Gameplay recordings

UI/UX elements

Game logic or difficulty systems

to train, build, improve, validate, or test any artificial intelligence or machine learning system, whether commercial or non-commercial.

Violation may result in immediate termination and legal action.

6. Subscriptions & Virtual Goods

Certain features may require subscriptions or in-app purchases

Payments are processed through third-party platforms (Google Play, Apple App Store, etc.)

Subscriptions auto-renew unless cancelled via platform settings

Virtual Goods:

Have no real-world monetary value

Are non-transferable and non-refundable once used

Cannot be exchanged for cash or property

Loss due to misuse or unauthorized access is solely Your responsibility.

7. Availability & Updates

We may update, modify, suspend, or discontinue any feature at any time

We do not guarantee uninterrupted or error-free availability

Continued use after updates constitutes acceptance of changes

8. User Conduct

You agree to:

Use the App lawfully and ethically

Not upload or share Unacceptable Conduct or Content

Not harm other users, systems, or Meta Infinium’s reputation

We reserve the right to suspend or terminate accounts at our discretion.

9. Intellectual Property Rights

All Intellectual Property Rights in Sudoku Infinium belong exclusively to Meta Infinium.

You gain no ownership rights by using the App.

10. Privacy

Your use of the App is governed by our Privacy Policy, which explains how we collect, use, store, and protect Your data in compliance with Indian laws.

11. Disclaimer of Warranties

THE APP IS PROVIDED “AS IS” AND “AS AVAILABLE.”

Meta Infinium disclaims all warranties, including:

Accuracy

Fitness for a particular purpose

Availability

Security

Error-free operation

You use the App at Your own risk.

12. Limitation of Liability

To the maximum extent permitted under Indian law:

Meta Infinium shall not be liable for any indirect, incidental, special, or consequential damages, including:

Loss of data or progress

Loss of revenue or profits

Business interruption

Total liability shall not exceed the amount paid by You in the last 12 months, if any.

13. Indemnification

You agree to indemnify and hold Meta Infinium harmless from any claims, damages, or losses arising from:

Your misuse of the App

Violation of this EULA

Infringement of third-party rights

14. Termination

We may suspend or terminate Your access immediately if You violate this EULA.

Upon termination:

All licenses granted to You cease

You must stop using the App

15. Governing Law & Jurisdiction

This EULA shall be governed by and construed in accordance with the laws of India.

All disputes shall be subject to the exclusive jurisdiction of the courts of India.

16. Amendments

We may modify this EULA from time to time.
Continued use of the App after changes means acceptance.

17. Contact Information

Meta Infinium
📧 info@metainfinium.com
      metainfinium@gmail.com

🌐 https://metainfinium.com`;

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const isHeading = /^\d+\.|\b(INTRODUCTION|DEFINITIONS|ACCEPTANCE|GRANT|RESTRICTIONS|AI & DATA|SUBSCRIPTIONS|AVAILABILITY|CONDUCT|PROPERTY|PRIVACY|DISCLAIMER|LIMITATION|INDEMNIFICATION|TERMINATION|GOVERNING|AMENDMENTS|CONTACT|DATA CONTROLLER|INFORMATION WE COLLECT|COOKIES|SOURCES OF DATA|PURPOSES OF PROCESSING|LEGAL BASIS|ADVERTISING|DATA SHARING|CROSS-BORDER|DATA RETENTION|CHILDREN|YOUR PRIVACY RIGHTS|SECURITY MEASURES|THIRD-PARTY LINKS|CHANGES|YOUR RIGHTS)\b/i.test(line);
      return (
        <p key={i} className={`${isHeading ? "font-bold text-gray-900 text-base mt-4 mb-2" : "mb-2"} ${line.trim() === "" ? "h-2" : ""}`}>
          {line}
        </p>
      );
    });
  };

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={logoImage} 
                alt="Meta Infinium Logo" 
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-sudoku-primary to-sudoku-accent bg-clip-text text-transparent">
                  Sudoku Infinium
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  Meta infinium product
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Bringing the best puzzle experiences to your screen.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-xs text-gray-400 hover:text-sudoku-primary transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button 
                onClick={() => setShowTerms(true)}
                className="text-xs text-gray-400 hover:text-sudoku-primary transition-colors"
              >
                Terms and Conditions
              </button>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact Us</h4>
            <div className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors">
              <Mail className="h-4 w-4" />
              <a href="mailto:metainfinium@gmail.com" className="text-sm">
                metainfinium@gmail.com
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Connect With Us</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://www.metainfinium.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">Website</span>
              </a>
              <a 
                href="https://www.linkedin.com/company/meta-infinium/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <SiLinkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a 
                href="https://www.instagram.com/metainfinium/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-sudoku-primary transition-colors"
              >
                <SiInstagram className="h-4 w-4" />
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 META INFINIUM. All rights reserved.
          </p>
        </div>
      </div>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Last Updated: 28 November 2025
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="text-sm text-gray-600 font-sans leading-relaxed">
              {formatText(EULA_TEXT)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              Last Updated: December 2025
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="text-sm text-gray-600 font-sans leading-relaxed">
              {formatText(PRIVACY_POLICY_TEXT)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
