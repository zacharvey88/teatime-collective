# Teatime Collective - Vegan Cake Business Website

A modern, full-stack web application for Teatime Collective, a vegan cake business specialising in festival catering and market trading since 2013.

## 🎂 About

Teatime Collective is a vegan cake business that serves festivals, markets, and private events. This website provides a complete online presence including cake ordering, admin management, and business information.

## ✨ Features

### Customer-Facing Features
- **Cake Catalogue**: Browse standalone cakes and category-based cakes with flavours and sizes
- **Online Ordering**: Complete order system with cart functionality
- **Responsive Design**: Mobile-friendly interface for all devices
- **Image Galleries**: Showcase cakes, weddings, festivals, and markets
- **Contact Information**: Easy access to business details and ordering

### Admin Features
- **Cake Management**: Add, edit, and manage standalone cakes and categories
- **Flavour & Size Management**: Create custom flavours with price overrides
- **Image Upload**: Upload and manage cake images
- **Order Management**: View and manage customer orders
- **Settings Management**: Configure business settings and contact information
- **Market Dates**: Manage upcoming market appearances
- **Analytics**: View order statistics and customer insights

### Technical Features
- **Real-time Updates**: Live order notifications and status updates
- **Image Optimisation**: Automatic image compression and optimisation
- **Search & Filtering**: Find cakes quickly with search functionality
- **Price Management**: Flexible pricing with flavour-specific overrides
- **Holiday Management**: Block dates for holidays and unavailable periods

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   - Run the Supabase setup script in your Supabase SQL editor
   - Configure storage buckets and policies
   - Set up authentication

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

## 🎨 Customisation

### Styling
- Primary colour: Orange (#FF6B35)
- Built with Tailwind CSS for easy customization
- Responsive design for all screen sizes

### Content Management
- Admin panel for easy content updates
- Image upload functionality
- Dynamic pricing and inventory management

---

Built with ❤️ for Teatime Collective
