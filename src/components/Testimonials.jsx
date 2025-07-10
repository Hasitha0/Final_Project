import React from 'react';
import { AnimatedShinyText } from './ui/animated-shiny-text';
import { BorderBeam } from './ui/border-beam';
import { MagicCard } from './ui/magic-card';
import { TextReveal } from './ui/text-reveal';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Community Member',
    image: 'https://i.pravatar.cc/150?img=1',
    content: 'EcoTech has transformed how I approach recycling. The rewards system makes it fun and engaging, and I love seeing my environmental impact grow!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Owner',
    image: 'https://i.pravatar.cc/150?img=2',
    content: 'As a business owner, partnering with EcoTech has been incredible. Their platform has helped us implement effective recycling programs and engage our customers.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Environmental Activist',
    image: 'https://i.pravatar.cc/150?img=3',
    content: 'The educational resources and community features are outstanding. EcoTech is creating real change by making recycling accessible and rewarding.',
    rating: 5,
  },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <BorderBeam className="h-full">
      <MagicCard className="bg-slate-900/70 p-8 rounded-xl h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {testimonial.name}
              </h3>
              <p className="text-slate-400">{testimonial.role}</p>
            </div>
          </div>
          <StarRating rating={testimonial.rating} />
          <blockquote className="mt-4 flex-grow">
            <p className="text-slate-300 italic">"{testimonial.content}"</p>
          </blockquote>
        </div>
      </MagicCard>
    </BorderBeam>
  );
};

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <TextReveal>
            <AnimatedShinyText className="text-4xl font-bold mb-4">
              What Our Users Say
            </AnimatedShinyText>
          </TextReveal>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Join thousands of satisfied users who are making a difference with
            EcoTech's innovative recycling platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 