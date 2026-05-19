'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createArticle } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('nutrition');
  const [author, setAuthor] = useState('FitAI Team');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      toast.success('Article created!');
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

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!content.trim()) return toast.error('Content is required');
    mutation.mutate({ title, summary, content, category, author, imageUrl, tags, isPublished: true } as any);
  };

  const inputClass = 'w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  const categories = ['nutrition', 'workout', 'yoga', 'mental_health', 'weight_loss', 'weight_gain', 'supplements', 'lifestyle', 'indian_diet', 'international_diet', 'disease_management', 'recipes'];

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>

      <h1 className="text-2xl font-bold text-white">Create Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Article Details</h2>

          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. 10 Best Foods for Weight Loss" />
          </div>

          <div>
            <label className={labelClass}>Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`${inputClass} min-h-[60px]`} placeholder="Brief summary..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-gray-900">{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
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
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className={inputClass} placeholder="Add a tag and press Enter" />
              <button type="button" onClick={addTag} className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition-colors">Add</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Content *</h2>
          <p className="text-xs text-muted">Write your article content. You can use HTML tags for formatting.</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${inputClass} min-h-[400px] font-mono text-xs`}
            placeholder="<h2>Introduction</h2>&#10;<p>Write your article content here...</p>"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publish Article
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
