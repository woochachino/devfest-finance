// ArticleCard Component - Displays articles with platform-specific styling

export default function ArticleCard({ article }) {
    if (article.platform === 'twitter') {
        return <TwitterCard article={article} />;
    }
    if (article.platform === 'reddit') {
        return <RedditCard article={article} />;
    }
    return <NewsCard article={article} />;
}

function TwitterCard({ article }) {
    return (
        <div className="twitter-card group">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-twitter/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {article.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{article.author}</span>
                        <span className="text-slate-500">@{article.handle}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-500 text-sm">{article.date}</span>
                    </div>
                </div>
                <div className="text-twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <p className="text-white/90 leading-relaxed mb-4">{article.content}</p>

            {/* Engagement */}
            <div className="flex items-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-1.5 hover:text-twitter transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Reply
                </span>
                <span className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {article.retweets}
                </span>
                <span className="flex items-center gap-1.5 hover:text-pink-500 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {article.likes}
                </span>
            </div>
        </div>
    );
}

function RedditCard({ article }) {
    return (
        <div className="reddit-card group">
            {/* Voting */}
            <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 text-slate-500">
                    <button className="hover:text-reddit transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
                        </svg>
                    </button>
                    <span className="font-bold text-reddit text-sm">{article.upvotes}</span>
                    <button className="hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5 rotate-180" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <span className="text-reddit font-medium">{article.subreddit}</span>
                        <span>•</span>
                        <span>Posted by {article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-reddit transition-colors">
                        {article.title}
                    </h3>

                    {/* Content */}
                    <p className="text-white/80 leading-relaxed">{article.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1.5 hover:bg-slate-700/50 px-2 py-1 rounded transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Comments
                        </span>
                        <span className="flex items-center gap-1.5 hover:bg-slate-700/50 px-2 py-1 rounded transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NewsCard({ article }) {
    return (
        <div className="news-card group hover:border-primary-500/30">
            {/* Source & Date */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-primary-400 font-semibold text-sm uppercase tracking-wide">
                    {article.source}
                </span>
                <span className="text-slate-500 text-sm">{article.date}</span>
            </div>

            {/* Title */}
            <h3 className="text-white font-bold text-xl mb-3 leading-tight group-hover:text-primary-400 transition-colors">
                {article.title}
            </h3>

            {/* Content */}
            <p className="text-white/80 leading-relaxed">{article.content}</p>

            {/* Read more indicator */}
            <div className="mt-4 flex items-center gap-2 text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Read full article</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}
