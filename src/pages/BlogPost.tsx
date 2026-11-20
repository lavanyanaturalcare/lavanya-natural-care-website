import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, ChevronRight, Share2, Sparkles } from 'lucide-react';
import { blogPostsData } from '../data/blogPosts';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = blogPostsData.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <SEO
          title="Article Not Found | ONZNATURAL"
          description="The requested botanical skincare article could not be found."
        />
        <h2 className="font-serif text-3xl font-bold text-botanical-950">Article Not Found</h2>
        <p className="text-warmgray-600">The guide you are looking for has been moved or does not exist.</p>
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-botanical-800 text-white font-semibold text-sm hover:bg-botanical-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skincare Guides</span>
        </button>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: `https://onznatural.com${post.coverImage}`,
    author: {
      '@type': 'Organization',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'ONZNATURAL',
      logo: {
        '@type': 'ImageObject',
        url: 'https://onznatural.com/favicon.svg'
      }
    },
    datePublished: '2026-11-15',
    description: post.metaDescription,
    mainEntityOfPage: `https://onznatural.com/blog/${post.slug}`
  };

  return (
    <div className="py-10 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <SEO
        title={`${post.title.slice(0, 50)} | ONZNATURAL`}
        description={post.metaDescription}
        image={post.coverImage}
        schema={articleSchema}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-warmgray-500">
        <Link to="/" className="hover:text-botanical-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/blog" className="hover:text-botanical-900 transition-colors">Guides</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-botanical-950 font-semibold truncate max-w-[200px] sm:max-w-none">{post.title}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4 text-center sm:text-left">
        <span className="inline-block px-3.5 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-bold uppercase tracking-wider">
          {post.category}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-botanical-950 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-warmgray-500 pt-2 border-b border-cream-200 pb-4">
          <span className="flex items-center gap-1.5 font-medium text-botanical-950">
            <User className="w-3.5 h-3.5 text-gold-600" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            {post.publishDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-600" />
            {post.readTime}
          </span>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-cream-50 border border-cream-200 flex items-center justify-center p-8 shadow-sm">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Article Body Content */}
      <article
        className="prose prose-stone max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-cream-200 shadow-xs space-y-6 text-warmgray-800 text-sm sm:text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Bottom CTA Card */}
      <div className="p-8 rounded-3xl bg-botanical-900 text-cream-50 space-y-4 border border-botanical-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Pure Botanical Care in Vadodara</span>
          </div>
          <h2 className="font-serif text-2xl font-bold">Experience Handcrafted Cold Process Soap</h2>
          <p className="text-xs sm:text-sm text-cream-200 max-w-xl">
            Explore our small-batch cold process soap collection cured naturally for 4 to 6 weeks with pure plant oils.
          </p>
        </div>
        <Link
          to="/products"
          className="btn-whatsapp-3d text-white px-6 py-3.5 rounded-xl font-bold text-sm shrink-0"
        >
          Explore All Products
        </Link>
      </div>
    </div>
  );
};
