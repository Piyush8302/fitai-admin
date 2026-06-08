'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticles, deleteArticle } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Trash2, Edit, Loader2, Eye, Heart, Search, Crown } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const categoryColors: Record<string, string> = {
  nutrition: 'text-green-400 bg-green-400/10',
  workout: 'text-blue-400 bg-blue-400/10',
  wellness: 'text-purple-400 bg-purple-400/10',
  weight_loss: 'text-emerald-400 bg-emerald-400/10',
  weight_gain: 'text-orange-400 bg-orange-400/10',
  yoga: 'text-pink-400 bg-pink-400/10',
  mental_health: 'text-violet-400 bg-violet-400/10',
  indian_diet: 'text-amber-400 bg-amber-400/10',
  supplements: 'text-cyan-400 bg-cyan-400/10',
};

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const filtered = Array.isArray(articles)
    ? articles.filter((a: any) => !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="text-sm text-muted mt-1">{filtered.length} articles</p>
        </div>
        <Link href="/articles/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article: any) => (
            <div key={article._id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group">
              {/* Image or gradient header */}
              {article.image ? (
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${article.image})` }} />
              ) : (
                <div className="h-20 bg-gradient-to-br from-primary/20 to-pink-500/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary/40" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 flex-1">{article.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <Link href={`/articles/${article._id}/edit`} className="p-1 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(article._id); }} className="p-1 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {article.summary && (
                  <p className="text-xs text-muted line-clamp-2 mb-3">{article.summary}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[article.category] || 'text-gray-400 bg-gray-400/10'}`}>
                    {(article.category || '').replace(/_/g, ' ')}
                  </span>
                  {article.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                  {(article.tags || []).slice(0, 2).map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-700/50 rounded-full text-[10px] text-gray-400">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> {article.likes || 0}</span>
                  </div>
                  <span>{article.readTime || 5} min read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl py-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
          <p className="text-sm text-muted">{search ? 'No articles match your search' : 'No articles yet. Create your first article!'}</p>
        </div>
      )}
    </div>
  );
}
