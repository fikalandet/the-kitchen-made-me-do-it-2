import React from 'react';
import { ArticleCard } from './ArticleCard';
import { EmptyState } from './EmptyState';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image_url?: string;
  author?: string;
}

interface CharityArticlesSectionProps {
  articles: Article[];
}

export const CharityArticlesSection: React.FC<CharityArticlesSectionProps> = ({ articles }) => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="font-lobster text-3xl text-gray-800 mb-1">En sked för mamma</h2>
          <p className="text-gray-700">Gör gott för andra genom mat</p>
        </div>
        {articles.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        ) : (
          <EmptyState text="Inget här ännu" />
        )}
      </div>
    </section>
  );
};
