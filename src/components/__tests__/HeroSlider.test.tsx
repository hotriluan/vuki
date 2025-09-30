import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider';

const slides: HeroSlide[] = [
  { id: 's1', image: 'https://example.com/a.jpg', alt: 'A', heading: 'Slide A', subheading: 'First', ctaLabel: 'Go A', ctaHref: '/a', theme: 'dark' },
  { id: 's2', image: 'https://example.com/b.jpg', alt: 'B', heading: 'Slide B', subheading: 'Second', ctaLabel: 'Go B', ctaHref: '/b', theme: 'dark' }
];

describe('HeroSlider', () => {
  it('renders slides and can navigate next', () => {
    render(<HeroSlider slides={slides} autoPlayMs={0} />);
    expect(screen.getByRole('group', { name: /1 \/ 2/i })).toBeInTheDocument();
    const next = screen.getByRole('button', { name: /next slide/i });
    fireEvent.click(next);
    expect(screen.getByRole('group', { name: /2 \/ 2/i })).toBeInTheDocument();
  });
});
