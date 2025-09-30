import { FeaturedProducts } from './(sections)/FeaturedProducts';
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider';

const heroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1600&q=60',
    alt: 'White minimalist running shoes on gradient backdrop',
    heading: 'Bước Chân Tự Tin',
    subheading: 'Bộ sưu tập giày hiệu suất & phong cách hằng ngày – tối ưu thoải mái, tối ưu cảm hứng.',
    ctaLabel: 'Mua ngay',
    ctaHref: '/category/sneakers',
    theme: 'dark',
    overlayOpacity: 0.45
  },
  {
    id: 'hero-2',
    image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1600&q=60',
    alt: 'Close up of leather boot with dramatic lighting',
    heading: 'Chất Liệu Tuyển Chọn',
    subheading: 'Da thuộc xử lý mềm – bền đẹp theo thời gian. Khám phá dòng boots mới.',
    ctaLabel: 'Xem boots',
    ctaHref: '/category/boots',
    theme: 'dark',
    overlayOpacity: 0.5
  },
  {
    id: 'hero-3',
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1600&q=60',
    alt: 'Sport shoes in dynamic motion with dust particles',
    heading: 'Hiệu Năng & Kiểu Dáng',
    subheading: 'Thiết kế khí động học hỗ trợ chạy dài & luyện tập cường độ cao.',
    ctaLabel: 'Performance Line',
    ctaHref: '/category/limited',
    theme: 'dark',
    overlayOpacity: 0.55
  }
];

export default function HomePage() {
  return (
    <>
      <HeroSlider slides={heroSlides} className="border-b" />
      <div id="featured">
        <FeaturedProducts />
      </div>
    </>
  );
}
