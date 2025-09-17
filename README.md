# Teatime Collective - Vegan Cake Business Website

A modern, full-stack web application for Teatime Collective, a vegan cake business specialising in festival catering and market trading since 2013.

## 🎂 About

Teatime Collective is a vegan cake business that serves festivals, markets, and private events. This website provides a complete online presence including cake ordering, admin management, and business information.

## ✨ Features

### Customer-Facing Features
- **Cake Catalogue**: Browse standalone cakes and category-based cakes with flavours and sizes
- **Online Ordering**: Complete order system with cart functionality and custom cake options
- **Responsive Design**: Mobile-friendly interface for all devices
- **Image Galleries**: Showcase cakes, weddings, festivals, and markets
- **Contact Form**: Easy contact form with email notifications
- **Market Information**: View upcoming market appearances and locations
- **Testimonials**: Customer reviews and feedback display
- **Festival & Wedding Content**: Dedicated sections for special events

### Admin Dashboard Features
- **Cake Management**: 
  - Add, edit, and delete standalone cakes
  - Manage cake categories (Regular, Frilly, Tray Bakes, Cheesecakes)
  - Create and manage cake sizes with pricing
  - Custom flavour management with price overrides
  - Cake search and filtering capabilities

- **Image Management**:
  - Upload and manage cake images
  - Organize images by type (carousel, weddings, festivals, custom cakes)
  - Image reordering and activation/deactivation
  - Automatic image optimization

- **Order Management**:
  - View all customer orders with detailed information
  - Update order status (new, reviewed, approved, rejected, completed, archived)
  - Order analytics and statistics
  - Customer information management
  - Order search and filtering

- **Content Management**:
  - Home page content editing (titles, subtitles, descriptions)
  - Festival and wedding section content
  - Testimonial management with display ordering
  - Holiday management (block unavailable dates)
  - Market dates and locations management

- **Settings & Configuration**:
  - Business information and contact details
  - Email settings for order notifications
  - Site branding (logo, colors, titles)
  - Order form notices and messages
  - Cart and checkout configuration

- **User Management**:
  - Multi-user admin system
  - Role-based access control
  - Password management
  - Session management

### Technical Features
- **Real-time Updates**: Live order notifications and status updates
- **Image Optimisation**: Automatic image compression and optimisation
- **Search & Filtering**: Find cakes quickly with search functionality
- **Price Management**: Flexible pricing with flavour-specific overrides
- **Holiday Management**: Block dates for holidays and unavailable periods
- **Email Integration**: Automated order confirmations and contact form emails
- **Secure Authentication**: NextAuth.js with JWT sessions
- **Database Security**: Row Level Security (RLS) policies

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: NextAuth.js with JWT sessions
- **Email**: Resend API for transactional emails
- **Deployment**: Vercel
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Security**: Row Level Security (RLS), bcrypt password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd teatime-collective
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   AUTH_SECRET=your_auth_secret
   
   # Admin User Credentials (bcrypt hashed passwords)
   ADMIN_EMAIL_1=admin1@example.com
   ADMIN_NAME_1=Admin User 1
   ADMIN_ROLE_1=superadmin
   ADMIN_PASSWORD_HASH_1=your_bcrypt_hash_1
   
   ADMIN_EMAIL_2=admin2@example.com
   ADMIN_NAME_2=Admin User 2
   ADMIN_ROLE_2=admin
   ADMIN_PASSWORD_HASH_2=your_bcrypt_hash_2
   
   # Email Configuration
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Set up the database**
   - Create the necessary tables in your Supabase SQL editor
   - Configure storage buckets and RLS policies
   - Set up authentication and admin users
   - Contact the development team for database schema details

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
teatime-collective/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── cakes/             # Cake catalogue
│   ├── order/             # Ordering system
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility functions and services
│   ├── cakeService.ts    # Cake management
│   ├── orderService.ts   # Order processing
│   ├── supabaseClient.ts # Database client
│   └── ...
├── public/               # Static assets
│   └── images/          # Images and logos
└── supabase/            # Supabase functions
    └── functions/       # Edge functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

The application uses Supabase with the following main tables:
- `cakes` - Standalone cakes and category flavours
- `cake_categories` - Cake categories (e.g., Cheesecakes)
- `cake_sizes` - Available sizes and pricing
- `order_requests` - Customer orders
- `customers` - Customer information
- `settings` - Business configuration
- `market_dates` - Upcoming market appearances
- `holidays` - Blocked dates for holidays
- `reviews` - Customer testimonials
- `carousel_images` - Homepage carousel images
- `wedding_images` - Wedding gallery images
- `festival_images` - Festival gallery images

## 🔒 Security Features

The application implements a comprehensive multi-layer security system to protect sensitive data:

### Authentication & Authorization
- **NextAuth.js JWT Sessions**: Secure token-based authentication
- **Bcrypt Password Hashing**: All passwords are securely hashed
- **Role-Based Access Control**: Different permission levels for admin users
- **Session Validation**: Every admin API request validates the session
- **Environment Variable Storage**: All sensitive credentials stored securely

### Database Security
- **Row Level Security (RLS)**: Database-level access control on all tables
- **Granular Permissions**: Different access levels for read/write operations
- **Public Read Access**: Only non-sensitive data (cakes, images, settings) is publicly readable
- **Admin-Only Write Access**: All management operations require authentication
- **Service Role Key**: Server-side operations use elevated permissions securely

### API Protection
- **Server-Side Authentication**: All admin endpoints validate sessions
- **Input Validation**: All API inputs are validated and sanitized
- **Error Handling**: Sensitive information is not exposed in error messages
- **Rate Limiting**: Built-in protection against abuse

### Client-Side Security
- **No Direct Database Access**: Client-side code cannot directly access the database
- **API-Only Data Access**: All data operations go through protected API routes
- **Session-Based UI**: Admin components only render for authenticated users
- **Middleware Protection**: Admin routes are protected at the Next.js level

### Data Access Patterns
- **Public Data**: Cakes, images, settings, market dates (read-only)
- **Admin-Only Data**: Orders, customer data, content management (full control)
- **Secure Operations**: All admin functions use authenticated API routes

## 👨‍💼 Admin Access

### Admin Dashboard
Access the admin dashboard at `/admin` with the following features:

- **Login System**: Secure authentication with email/password
- **Multi-User Support**: Multiple admin users with different roles
- **Dashboard Overview**: Order statistics and quick actions
- **Tabbed Interface**: Organized sections for different management tasks

### Admin Capabilities
- **Full CRUD Operations**: Create, read, update, delete for all content types
- **Bulk Operations**: Mass updates and batch processing
- **Image Management**: Upload, organize, and optimize images
- **Order Processing**: Complete order lifecycle management
- **Content Editing**: Real-time content updates across the site
- **Settings Configuration**: Business settings and email configuration

### Getting Admin Access
1. Set up admin credentials in environment variables
2. Generate bcrypt password hashes for admin users
3. Access `/admin/login` to authenticate
4. Use the admin dashboard to manage all site content

## 🎨 Customisation

### Styling
- **Primary Colour**: Orange (#FF6B35) - easily changeable in settings
- **Tailwind CSS**: Built for easy customization and theming
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Component Library**: Radix UI components for consistent design

### Content Management
- **Admin Panel**: Complete content management system
- **Image Upload**: Drag-and-drop image management with optimization
- **Dynamic Pricing**: Flexible pricing system with flavour overrides
- **Content Sections**: Editable home page, festival, and wedding content
- **Email Templates**: Customizable order confirmation and contact emails

### Business Configuration
- **Contact Information**: Easily update business details
- **Market Dates**: Manage upcoming appearances and locations
- **Holiday Management**: Block unavailable dates
- **Order Settings**: Configure order form messages and notices
- **Email Settings**: Set up order notification emails

---

Built with ❤️ for Teatime Collective
