# Admin Marketing Components

## 📌 Purpose
This folder contains the marketing management components for the Mirror Exhibit admin dashboard. These components provide comprehensive marketing tools including email campaigns, abandoned cart recovery, affiliate management, and analytics.

## 📂 Files Overview
- `MarketingDashboard.tsx` - Main marketing hub dashboard with feature overview
- `EmailCampaignsManager.tsx` - Email campaign management interface with SendGrid integration
- `EmailCampaigns.tsx` - **LEGACY** Basic email campaign component (replaced by EmailCampaignsManager)
- `AbandonedCartsManager.tsx` - Abandoned cart recovery dashboard and management
- `AffiliatesManager.tsx` - Affiliate partner management and tracking system

## 🧩 Components and Functions

### MarketingDashboard.tsx
- **Purpose:** Central hub for all marketing features and tools
- **Features:**
  - Feature overview cards with status indicators (Active, Beta, Coming Soon)
  - Quick stats dashboard
  - Navigation to specific marketing tools
  - Filter tabs for feature categories
- **Dependencies:** Heroicons, Next.js routing

### EmailCampaignsManager.tsx
- **Purpose:** Comprehensive email campaign management with SendGrid integration
- **Features:**
  - Campaign overview with performance metrics
  - Status tracking (Draft, Scheduled, Sending, Sent)
  - Open rate and click rate analytics
  - Campaign filtering and search
  - Integration ready for SendGrid API
- **Mock Data:** Includes sample campaigns for demonstration
- **Status:** Ready for SendGrid integration

### AbandonedCartsManager.tsx
- **Purpose:** Monitor and recover abandoned shopping carts
- **Features:**
  - Real-time abandoned cart tracking
  - Funnel stage analysis (Items Added → Checkout Started → Form Completed → Payment Started)
  - Recovery email tracking
  - Customer behavior analytics
  - Device and UTM source tracking
- **Integration:** Connected to existing cart tracking service
- **Status:** Active with existing cart tracking infrastructure

### AffiliatesManager.tsx
- **Purpose:** Manage affiliate partners and track performance
- **Features:**
  - Affiliate registration and approval workflow
  - Commission rate management
  - Performance tracking and analytics
  - Payment method management
  - Status management (Active, Pending, Suspended)
- **Mock Data:** Sample affiliate data for demonstration
- **Status:** Planned feature - UI ready for backend integration

## 🎯 Marketing Features Roadmap

### **Active Features**
1. **Abandoned Cart Recovery**
   - ✅ Real-time cart tracking
   - ✅ Funnel stage analysis
   - ✅ Recovery email infrastructure
   - ✅ Performance analytics

2. **Email Infrastructure**
   - ✅ SendGrid integration
   - ✅ Email queue system
   - ✅ Template management
   - ✅ Delivery tracking

### **Beta Features**
1. **Customer Analytics**
   - 🔄 Customer lifetime value tracking
   - 🔄 Purchase behavior analysis
   - 🔄 Segmentation tools

2. **Marketing Reports**
   - 🔄 ROI dashboard
   - 🔄 Campaign performance metrics
   - 🔄 Conversion funnel analysis

### **Coming Soon Features**
1. **Affiliate Management**
   - 🚧 Partner registration system
   - 🚧 Commission tracking
   - 🚧 Payment processing
   - 🚧 Performance analytics

2. **Marketing Automation**
   - 🚧 Workflow builder
   - 🚧 Trigger-based campaigns
   - 🚧 Customer journey mapping

3. **Promotional Tools**
   - 🚧 Advanced discount management
   - 🚧 Flash sales system
   - 🚧 Referral programs
   - 🚧 Loyalty points system

## 🔗 Integration Points

### **SendGrid Email Service**
- **File:** `src/services/emailService.ts`
- **Features:** Email sending, queue management, template handling
- **Status:** Active and ready for campaign integration

### **Cart Tracking Service**
- **File:** `src/services/cartTrackingService.ts`
- **Features:** Abandoned cart detection, funnel tracking, recovery metrics
- **Status:** Active with enhanced marketing tracking

### **Database Schema**
- **Tables:** `cart_tracking`, `email_queue`, `email_templates`
- **Views:** `cart_tracking_marketing_funnel`
- **Functions:** `get_marketing_targets()`

## 🚀 Implementation Priority

### **Phase 1: Email Campaign Builder**
1. Campaign creation interface
2. Template editor integration
3. Recipient list management
4. A/B testing framework

### **Phase 2: Affiliate System**
1. Affiliate registration portal
2. Tracking link generation
3. Commission calculation engine
4. Payment processing integration

### **Phase 3: Advanced Analytics**
1. Customer segmentation tools
2. Predictive analytics
3. ROI attribution modeling
4. Custom reporting dashboard

## 📊 Performance Metrics

### **Email Campaigns**
- Open rates, click rates, conversion rates
- Unsubscribe rates, bounce rates
- Revenue attribution per campaign

### **Abandoned Cart Recovery**
- Recovery rate by funnel stage
- Time-to-recovery analytics
- Revenue recovered per email

### **Affiliate Performance**
- Click-through rates, conversion rates
- Commission payouts, ROI per affiliate
- Top-performing partners and products

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-22 | Created comprehensive marketing dashboard with feature overview    | Centralize marketing tools     |
| 2025-01-22 | Built email campaigns manager with SendGrid integration readiness | Enable campaign management     |
| 2025-01-22 | Developed abandoned carts manager using existing tracking service | Leverage existing infrastructure |
| 2025-01-22 | Designed affiliate management system with performance tracking    | Prepare for affiliate program  |
| 2025-01-22 | Added marketing menu item to admin navigation                     | Improve admin UX               |
