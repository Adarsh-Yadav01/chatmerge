
'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Heart,
    MessageCircle,
    Share,
    Eye,
    Users,
    TrendingUp,
    Calendar,
    ExternalLink,
    BarChart3,
    Activity,
    AlertCircle,
    ChevronRight,
    Images,
    Video,
    Layers,
    X,
    UserCircle,
    Clock
} from 'lucide-react';
import Loader from '@/app/components/Loader';
import instalogo from "../../../../../public/instalogo.webp";
import Image from 'next/image';

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState(null);
    const [media, setMedia] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [afterCursor, setAfterCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaInsights, setMediaInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const fetchAnalytics = async (after = '') => {
        if (loading || loadingMore || !hasMore) return;
        const setLoadingState = after ? setLoadingMore : setLoading;
        setLoadingState(true);
        try {
            console.log('🚀 Fetching analytics for user:', session.user.email);
            const response = await fetch(`/api/instagram/analytics?email=${encodeURIComponent(session.user.email)}${after ? `&after=${after}` : ''}`);
            console.log('📊 API Response Status:', response.status);
            console.log('📊 API Response Headers:', response.headers);
            const data = await response.json();
            console.log('📊 Complete API Response Data:', data);
            console.log('📊 Response Data Type:', typeof data);
            console.log('📊 Response Data Keys:', Object.keys(data));
            if (!response.ok) {
                console.error('❌ API Error Response:', data);
                throw new Error(data.message || 'Failed to fetch analytics');
            }
            if (!after) {
                setProfile(data.profile);
            }
            setMedia((prev) => [...prev, ...data.media]);
            setAfterCursor(data.paging?.cursors?.after || null);
            setHasMore(!!data.paging?.next);
            console.log('✅ Analytics data successfully set to state');
        } catch (err) {
            console.error('❌ Error fetching analytics:', err);
            console.error('❌ Error stack:', err.stack);
            setError(err.message);
        } finally {
            setLoadingState(false);
            console.log('🏁 Analytics fetch completed');
        }
    };

    const fetchMediaInsights = async (mediaId) => {
        setLoadingInsights(true);
        setMediaInsights(null);
        try {
            const response = await fetch(`/api/instagram/media/${mediaId}/insights`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch media insights');
            }
            setMediaInsights(data.insights);
        } catch (err) {
            console.error('❌ Error fetching media insights:', err);
            setError(err.message);
        } finally {
            setLoadingInsights(false);
        }
    };

    useEffect(() => {
        if (status === 'loading' || !session || session.user.role !== 'USER') return;
        fetchAnalytics();
    }, [session, status]);

    useEffect(() => {
        if (!hasMore || loading || loadingMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchAnalytics(afterCursor);
                }
            },
            { threshold: 0.1 }
        );
        if (observerRef.current) {
            observer.observe(observerRef.current);
        }
        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [afterCursor, hasMore, loading, loadingMore]);

    useEffect(() => {
        if (selectedMedia) {
            fetchMediaInsights(selectedMedia.id);
        }
    }, [selectedMedia]);

    const getInsightIcon = (name) => {
        const lowerName = name ? name.toLowerCase() : '';
        if (lowerName.includes('reach')) return <Eye className="w-5 h-5" />;
        if (lowerName.includes('likes')) return <Heart className="w-5 h-5" />;
        if (lowerName.includes('comments')) return <MessageCircle className="w-5 h-5" />;
        if (lowerName.includes('shares')) return <Share className="w-5 h-5" />;
        if (lowerName.includes('saved')) return <Activity className="w-5 h-5" />;
        if (lowerName.includes('views')) return <Eye className="w-5 h-5" />;
        if (lowerName.includes('interactions')) return <TrendingUp className="w-5 h-5" />;
        if (lowerName.includes('follows')) return <Users className="w-5 h-5" />;
        if (lowerName.includes('profile_visits')) return <UserCircle className="w-5 h-5" />;
        if (lowerName.includes('profile_activity')) return <Activity className="w-5 h-5" />;
        if (lowerName.includes('video_view_total_time') || lowerName.includes('avg_watch_time')) return <Clock className="w-5 h-5" />;
        return <BarChart3 className="w-5 h-5" />;
    };

    const getMediaIcon = (type) => {
        switch (type) {
            case 'IMAGE': return <Images className="w-4 h-4" />;
            case 'VIDEO': return <Video className="w-4 h-4" />;
            case 'CAROUSEL_ALBUM': return <Layers className="w-4 h-4" />;
            default: return <Images className="w-4 h-4" />;
        }
    };

    const formatNumber = (num) => {
        if (typeof num !== 'number') return 'N/A';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatTime = (milliseconds) => {
        if (typeof milliseconds !== 'number') return 'N/A';
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    };

    const formatCaption = (caption) => {
        if (!caption) return 'No caption available';
        const cleanCaption = caption.split('#')[0].trim();
        return cleanCaption || caption.substring(0, 100) + (caption.length > 100 ? '...' : '');
    };

    if (status === 'loading') {
        return <Loader />;
    }

    if (!session || session.user.role !== 'USER') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center max-w-md w-full">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
                    <p className="text-gray-500 text-sm">Please log in with a user account to view your Media dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Media Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Track and analyze your Instagram performance</p>
                        </div>
                    </div>
                </div>

                {/* Profile Overview */}
                {profile && (
                    <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center space-x-4">
                            <img
                                src={profile.profile_picture_url || '/default-profile.png'}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">@{profile.username}</h2>
                                <p className="text-gray-600 text-sm">{profile.biography || 'No bio available'}</p>
                                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                                    <span><strong>{formatNumber(profile.followers_count)}</strong> Followers</span>
                                    <span><strong>{formatNumber(profile.media_count)}</strong> Posts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-xl">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-indigo-900 text-sm font-medium">Fetching latest media...</p>
                        </div>
                    </div>
                )}

                {/* Media Grid */}
                {media && media.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Image
                                    src={instalogo}
                                    alt="Instagram Logo"
                                    className="w-6 h-6 mr-2"
                                />
                                Recent Posts
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {media.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                                    onClick={() => setSelectedMedia(post)}
                                >
                                    <div className="aspect-square relative bg-gray-100">
                                        {post.media_type === 'VIDEO' ? (
                                            <video
                                                src={post.media_url}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                poster={post.thumbnail_url || '/fallback-video.jpg'}
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error(`Video load error for post ID: ${post.id}, URL: ${post.media_url}`);
                                                    e.target.poster = '/fallback-video.jpg';
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={post.media_url}
                                                alt="Instagram post"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error(`Image load error for post ID: ${post.id}, URL: ${post.media_url}`);
                                                    e.target.src = '/fallback-image.jpg';
                                                }}
                                            />
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <div className="bg-gray-900/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 backdrop-blur-sm">
                                                {getMediaIcon(post.media_type)}
                                                <span>{post.media_type.replace('_', ' ').toLowerCase()}</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <a
                                                href={post.permalink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-gray-900/60 text-white p-1.5 rounded-full hover:bg-gray-900/80 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{formatCaption(post.caption)}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {new Date(post.timestamp).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            {post.username && (
                                                <span className="font-medium text-gray-900">@{post.username}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hasMore && (
                            <div ref={observerRef} className="flex justify-center py-8">
                                {loadingMore ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="text-indigo-900 text-sm font-medium">Loading more posts...</p>
                                    </div>
                                ) : (
                                    <div className="h-10" />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* No Data Available */}
                {!loading && !error && (!media || media.length === 0) && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Data Available</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Connect your Instagram account and start posting to see your media data here.
                        </p>
                    </div>
                )}

                {/* Media Insights Modal */}
                {selectedMedia && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMedia(null)}>
                        <div 
                            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-semibold text-gray-900">Post Insights</h3>
                                <button onClick={() => setSelectedMedia(null)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                {/* Post Preview */}
                                <div className="space-y-4">
                                    {selectedMedia.media_url && (
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                            {selectedMedia.media_type === 'VIDEO' ? (
                                                <video
                                                    src={selectedMedia.media_url}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                    poster={selectedMedia.thumbnail_url || '/fallback-video.jpg'}
                                                />
                                            ) : (
                                                <img
                                                    src={selectedMedia.media_url}
                                                    alt="Instagram post"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-gray-800 text-sm mb-2">{selectedMedia.caption || 'No caption'}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                                            <span>
                                                {new Date(selectedMedia.timestamp).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                })}
                                            </span>
                                            <a
                                                href={selectedMedia.permalink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-700 flex items-center"
                                            >
                                                View on Instagram <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Insights */}
                                <div className="space-y-6">
                                    <h4 className="text-md font-semibold text-gray-900 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                                        Performance Metrics
                                    </h4>
                                    {loadingInsights ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        </div>
                                    ) : mediaInsights ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {mediaInsights.map((insight) => (
                                                <div key={insight.name} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className="p-2 bg-white rounded-md shadow-sm">
                                                            {getInsightIcon(insight.name)}
                                                        </div>
                                                        <div>
                                                            <div className="text-xl font-bold text-gray-900">
                                                                {insight.name.includes('watch_time') 
                                                                    ? formatTime(insight.values[0].value) 
                                                                    : formatNumber(insight.values[0].value)}
                                                            </div>
                                                            <div className="text-sm text-gray-600 capitalize">
                                                                {insight.title || insight.name.replace(/_/g, ' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {insight.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No insights available for this post.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
