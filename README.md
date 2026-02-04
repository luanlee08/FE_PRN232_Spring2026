# Merged Frontend Project

Dự án frontend đã được gộp từ 2 source code:
- **User Interface**: Giao diện người dùng từ folder `fe/`
- **Admin Dashboard**: Giao diện admin từ folder `free-nextjs-admin-dashboard/`

## Cấu trúc thư mục

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css          # Merged CSS từ cả 2 projects
│   │   ├── page.tsx            # Trang chủ user (route: /)
│   │   ├── login/              # Trang đăng nhập user
│   │   ├── register/           # Trang đăng ký user
│   │   ├── products/           # Trang sản phẩm user
│   │   └── admin/              # Admin dashboard (route: /admin)
│   │       ├── layout.tsx      # Admin layout với sidebar
│   │       └── page.tsx        # Trang chủ admin
│   ├── components/
│   │   ├── user/               # Components cho user interface
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── product-card.tsx
│   │   │   └── ...
│   │   └── admin/              # Components cho admin dashboard
│   │       ├── ecommerce/
│   │       ├── form/
│   │       ├── ui/
│   │       └── ...
│   ├── layout/                 # Admin layout components
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Backdrop.tsx
│   ├── context/                # React contexts (admin)
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   ├── icons/                   # SVG icons (admin)
│   └── hooks/                  # Custom hooks (admin)
├── public/                     # Static assets từ cả 2 projects
└── package.json                # Merged dependencies
```

## Routes

- **User Interface**: 
  - `/` - Trang chủ
  - `/login` - Đăng nhập
  - `/register` - Đăng ký
  - `/products/[id]` - Chi tiết sản phẩm

- **Admin Dashboard**:
  - `/admin` - Dashboard chính
  - `/admin/...` - Các routes admin khác

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Start production server
npm start
```

## Dependencies đã merge

Tất cả dependencies từ cả 2 projects đã được merge vào `package.json`:
- Next.js 16.1.4
- React 19.2.3
- Tailwind CSS v4
- Các thư viện admin: ApexCharts, FullCalendar, Flatpickr, etc.
- Các thư viện user: Lucide React, Vercel Analytics, etc.

## Lưu ý

- User components nằm trong `src/components/user/`
- Admin components nằm trong `src/components/admin/`
- Admin layout có ThemeProvider và SidebarProvider riêng
- CSS đã được merge để hỗ trợ cả 2 giao diện
