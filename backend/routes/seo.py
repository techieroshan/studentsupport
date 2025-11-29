"""SEO and metadata routes."""
from fastapi import APIRouter, Response
from fastapi.responses import PlainTextResponse
from datetime import datetime
import os

router = APIRouter(tags=["seo"])

# Domain configuration
APP_DOMAIN = os.getenv("APP_DOMAIN", "studentsupport.newabilities.org")
ORG_NAME = os.getenv("ORG_NAME", "New Abilities Foundation")
ORG_ADDRESS = os.getenv("ORG_ADDRESS", "1320 Pepperhill Ln, Fort Worth, TX, 76131")
ORG_PHONE = os.getenv("ORG_PHONE", "1 (632) 432-9400")
ORG_CONTACT_URL = os.getenv("ORG_CONTACT_URL", "https://newabilities.org/contact")


@router.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    """Generate dynamic sitemap.xml."""
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Homepage -->
    <url>
        <loc>https://{APP_DOMAIN}/</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    
    <!-- Browse Page -->
    <url>
        <loc>https://{APP_DOMAIN}/browse</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
    
    <!-- Donors Page -->
    <url>
        <loc>https://{APP_DOMAIN}/donors</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    
    <!-- How It Works -->
    <url>
        <loc>https://{APP_DOMAIN}/how-it-works</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    
    <!-- Terms of Use -->
    <url>
        <loc>https://{APP_DOMAIN}/terms</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.5</priority>
    </url>
    
    <!-- Privacy Policy -->
    <url>
        <loc>https://{APP_DOMAIN}/privacy</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.5</priority>
    </url>
    
</urlset>'''
    
    return Response(content=sitemap_content, media_type="application/xml")


@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots():
    """Generate robots.txt with LLM-friendly rules."""
    robots_content = f'''# Student Support - Robots.txt
# Welcome to our robots.txt file! We're happy to have search engines and AI crawlers index our content.

# Allow all bots by default
User-agent: *
Allow: /
Allow: /api/public/*

# Disallow private API endpoints
Disallow: /api/auth/
Disallow: /api/users/profile
Disallow: /api/admin/

# LLM-Friendly Crawlers
User-agent: GPTBot
Allow: /
Allow: /llms.txt

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemaps
Sitemap: https://{APP_DOMAIN}/sitemap.xml
Sitemap: https://{APP_DOMAIN}/llms.txt

# Crawl-delay for respectful crawling
Crawl-delay: 1
'''
    
    return PlainTextResponse(content=robots_content)


@router.get("/llms.txt", response_class=PlainTextResponse)
async def get_llms_txt():
    """Generate llms.txt for AI context."""
    llms_content = f'''# Student Support - AI Context File

## Project Overview
Student Support is a global community-driven platform connecting students in need with donors providing free meals and food assistance. We prioritize dietary restrictions, medical needs, and anonymous, verified transactions.

## Organization
Name: {ORG_NAME}
Address: {ORG_ADDRESS}
Phone: {ORG_PHONE}
Contact: {ORG_CONTACT_URL}
Domain: https://{APP_DOMAIN}

## Core Features

### For Students (Seekers)
- Create meal requests with specific dietary needs (Vegan, Halal, Kosher, Gluten-Free, etc.)
- Specify medical requirements (No Oil, No Sugar, Dairy-Free, Low Sodium, etc.)
- Browse available meal offers on an interactive map
- Connect with verified donors anonymously
- Digital handshake verification with PIN codes
- Rate and review experiences

### For Donors
- Post meal offers with flexible fulfillment options (Pickup, Delivery, Dine-in, Meet-up)
- Manage weekly meal capacity
- Option for anonymous giving
- Verification system for trust and safety
- Track contribution impact

### Safety & Trust
- Email and phone verification
- Community moderation and flagging system
- Anonymous communication options
- Digital PIN verification for completed transactions
- Admin dashboard for content moderation

## Supported Dietary Preferences
- Vegetarian
- Vegan
- Hindu Veg (No Egg)
- Jain Veg (No Root Vegetables)
- Halal
- Kosher
- Gluten Free
- Nut Free
- No Oil
- No Restrictions

## Medical Dietary Requirements
- No Oil
- No Sugar
- Dairy Free
- Low Sodium
- Soft Food Only

## Fulfillment Options
- Pickup (Student travels to donor location)
- Delivery (Donor drops off to student)
- Dine-in (Hosted meal at donor's location)
- Meet Up (Public meeting spot)

## Key Pages

### Public Pages (No Authentication Required)
- Homepage: https://{APP_DOMAIN}/
- Browse Map: https://{APP_DOMAIN}/browse
- Donors & Partners: https://{APP_DOMAIN}/donors
- How It Works: https://{APP_DOMAIN}/how-it-works
- Terms of Use: https://{APP_DOMAIN}/terms
- Privacy Policy: https://{APP_DOMAIN}/privacy

### Authenticated Pages
- Student Dashboard
- Donor Dashboard
- Profile Management
- Messaging System
- Admin Moderation Panel

## API Endpoints (Public)

### Statistics
GET /api/users/stats
Returns: Platform statistics including total meals served, active students, active donors, and cities covered.

### Donors
GET /api/donors
Returns: List of verified donor organizations and partners.
Query Parameters: ?category={category}

### Public Offers (when available)
GET /api/offers
Returns: Available meal offers (location-based).

## Success Stories

Our platform has facilitated thousands of meal connections, supporting students from diverse backgrounds with culturally appropriate, dietary-compliant meals. We work with government agencies, religious organizations, non-profits, and individual philanthropists.

## FAQs

**Q: Is this service really free?**
A: Yes, completely free for students. We're funded by donors, grants, and community support.

**Q: How is privacy protected?**
A: We support anonymous requests and offers. Personal information is never shared without consent. All communications can be masked.

**Q: How are donors verified?**
A: We verify emails, phone numbers, and use community ratings. Large donors undergo additional verification.

**Q: What dietary restrictions are supported?**
A: We support 10+ dietary preferences including religious (Halal, Kosher), lifestyle (Vegan, Vegetarian), and medical restrictions.

**Q: Can international students use this?**
A: Yes! We're a global platform supporting students worldwide.

## SEO Keywords
student food assistance, free meals for students, college food support, university food aid, dietary restriction meals, halal student meals, kosher food students, vegan student food, gluten-free student assistance, international student food support, emergency food for students, verified food donations, anonymous meal support, community food programs

## Contact
For all inquiries, please visit: {ORG_CONTACT_URL}

## Last Updated
{datetime.now().strftime("%Y-%m-%d")}
'''
    
    return PlainTextResponse(content=llms_content)


@router.get("/schema.org/organization")  
async def get_organization_schema():
    """Get Schema.org Organization structured data."""
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": ORG_NAME,
        "url": f"https://{APP_DOMAIN}",
        "logo": f"https://{APP_DOMAIN}/logo.png",
        "description": "Global community-driven platform connecting students with free meals and food assistance, supporting diverse dietary and medical needs.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "1320 Pepperhill Ln",
            "addressLocality": "Fort Worth",
            "addressRegion": "TX",
            "postalCode": "76131",
            "addressCountry": "US"
        },
        "telephone": ORG_PHONE,
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "url": ORG_CONTACT_URL
        },
        "sameAs": [
            # Social media links will be added when provided
        ]
    }


@router.get("/schema.org/faq")
async def get_faq_schema():
    """Get Schema.org FAQPage structured data."""
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Is this service really free for students?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Student Support is completely free for students. We're funded by donors, grants, and community support to ensure no student goes hungry."
                }
            },
            {
                "@type": "Question",
                "name": "How is my privacy protected?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support anonymous requests and offers. Personal information is never shared without consent. All communications can be masked, and we use verified digital handshakes for transactions."
                }
            },
            {
                "@type": "Question",
                "name": "What dietary restrictions are supported?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support 10+ dietary preferences including Vegan, Vegetarian, Halal, Kosher, Gluten-Free, Nut-Free, Hindu Veg, Jain Veg, and medical restrictions like No Oil, No Sugar, Dairy-Free, and Low Sodium."
                }
            },
            {
                "@type": "Question",
                "name": "Can international students use this platform?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Student Support is a global platform supporting students worldwide, with culturally appropriate meal options and multi-language support."
                }
            },
            {
                "@type": "Question",
                "name": "How are donors verified?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We verify all donors through email and phone verification. Large institutional donors undergo additional verification. We also use community ratings and reviews to maintain trust and safety."
                }
            }
        ]
    }
