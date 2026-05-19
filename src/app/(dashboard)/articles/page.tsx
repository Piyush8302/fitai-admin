'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticles, deleteArticle } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Trash2, Edit, Loader2, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ArticlesPage() {
  const queryClient = useQueryClient();

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
    onError: () => toast.error('Failed to delete article'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="text-sm text-muted mt-1">{Array.isArray(articles) ? articles.length : 0} total articles</p>
        </div>
        <Link href="/articles/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Title', 'Category', 'Author', 'Views', 'Likes', 'Tags', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(articles) && articles.length > 0 ? (
                  articles.map((article: any) => (
                    <tr key={article._id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-pink-400" />
                          </div>
                          <span className="text-sm font-medium text-white max-w-[200px] truncate">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {article.category || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{article.author || '—'}</td>
                      <td className="px-5 py-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {article.views || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-red-400" /> {article.likes || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(article.tags || []).slice(0, 2).map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{article.createdAt ? formatDate(article.createdAt) : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/articles/${article._id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { if (confirm('Delete this article?')) deleteMutation.mutate(article._id); }} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-muted text-sm">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No articles found. Create your first article!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
