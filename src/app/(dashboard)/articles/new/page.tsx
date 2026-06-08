'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createArticle } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'workout', label: 'Workout' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'indian_diet', label: 'Indian Diet' },
  { value: 'international_diet', label: 'International Diet' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'disease_prevention', label: 'Disease Prevention' },
  { value: 'home_remedies', label: 'Home Remedies' },
];

const SOURCES = [
  { value: 'fitai', label: 'FitAI' },
  { value: 'indian', label: 'Indian' },
  { value: 'international', label: 'International' },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('nutrition');
  const [source, setSource] = useState('fitai');
  const [author, setAuthor] = useState('FitAI Health Team');
  const [imageUrl, setImageUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      toast.success('Article published!');
      router.push('/articles');
    },
    onError: () => toast.error('Failed to create article'),
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!summary.trim()) return toast.error('Summary is required');
    if (!content.trim()) return toast.error('Content is required');

    // Auto calculate read time (~200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    mutation.mutate({
      title, summary, content, category, source, author,
      image: imageUrl, isPremium, tags, readTime, isPublished: true,
    } as any);
  };

  const inputClass = 'w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-xs font-medium text-muted uppercase tracking-wider mb-1.5';

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>
      <h1 className="text-2xl font-bold text-white">Create Article</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. 10 Best Foods for Weight Loss" />
          </div>

          <div>
            <label className={labelClass}>Summary *</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`${inputClass} min-h-[60px]`} placeholder="Brief summary that appears in article cards..." rows={2} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
                {SOURCES.map(s => <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className={`${inputClass} flex-1`} placeholder="Type tag and press Enter" />
              <button type="button" onClick={addTag} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs text-white transition-colors shrink-0">Add</button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background" />
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm text-gray-300">Premium Only</span>
          </label>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <label className={labelClass}>Article Content *</label>
          <p className="text-[11px] text-muted -mt-1">Write your article. Use blank lines for paragraphs. HTML supported for headings (&lt;h2&gt;), bold (&lt;b&gt;), lists (&lt;ul&gt;).</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputClass} min-h-[300px] leading-relaxed`}
            placeholder="Write your article content here...

Start with an introduction about the topic.

Add sections with details, tips, and recommendations.

Include Indian food examples and practical advice."
          />
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            <span>~{Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200))} min read</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Article
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
