import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { blogPostsData } from '../data/blogPosts';
import { SEO } from '../components/SEO';

export const Blog: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEO
        title="Skincare Guides & Botanical Wisdom | Lavanya Natural Care"
        description="Read educational guides on handcrafted cold process soapmaking, Ayurvedic herbs for skin, and natural routines by Lavanya Natural Care in Vadodara."
      />

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Botanical Wisdom & Guides</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Handcrafted Skincare Knowledge
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          Learn the science behind cold-process soapmaking, understand your skin's botanical needs, and discover how pure plant oils transform everyday bathing.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPostsData.map((post) => (
          <article
            key={post.slug}
            className="card-3d rounded-3xl border border-cream-200 overflow-hidden flex flex-col justify-between group bg-white"
          >
            <div>
              <div className="h-52 bg-cream-50 overflow-hidden relative border-b border-cream-100 flex items-center justify-center p-6">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 bg-botanical-900 text-gold-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-6 sm:p-7 space-y-3">
                <div className="flex items-center gap-3 text-xs text-warmgray-500">
                  <span>{post.publishDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-600" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="font-serif text-xl sm:text-2xl font-bold text-botanical-950 group-hover:text-gold-700 transition-colors leading-snug">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-warmgray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {post.shortExcerpt}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 pt-0">
              <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-botanical-900 group-hover:text-gold-700 transition-colors"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
