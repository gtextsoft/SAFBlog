import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { PostCard } from "@/components/blog/PostCard";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { OrganizationStructuredData } from "@/components/seo/StructuredData";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

interface Category {
  name: string;
  slug: string;
}

interface Tag {
  name: string;
  slug: string;
}

interface Author {
  full_name: string;
  avatar_url?: string | null;
}

interface PostCategoryRelation {
  category: Category;
}

interface PostTagRelation {
  tag: Tag;
}

interface SupabasePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  author?: Author | null;
  post_categories?: PostCategoryRelation[] | null;
  post_tags?: PostTagRelation[] | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  publishedAt: string;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
  categories: Category[];
  tags: Tag[];
}

const Index = () => {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useScrollVisibility();

  const fetchPosts = async () => {
    setLoading(true);

    try {
      // Fetch featured post (most recent published post)
      const { data: featuredData, error: featuredError } = await supabase
        .from("posts")
        .select(`
          *,
          author:authors(*),
          post_categories(category:categories(*)),
          post_tags(tag:tags(*))
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (featuredError) {
        console.error("Error fetching featured post:", featuredError);
      }

      if (featuredData) {
        const postData = featuredData as SupabasePost;
        setFeaturedPost({
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || "",
          coverImageUrl: postData.cover_image_url || undefined,
          publishedAt: postData.published_at || "",
          author: {
            fullName: postData.author?.full_name || "Anonymous",
            avatarUrl: postData.author?.avatar_url || undefined,
          },
          categories: postData.post_categories?.map((pc: PostCategoryRelation) => pc.category) || [],
          tags: postData.post_tags?.map((pt: PostTagRelation) => pt.tag) || [],
        });
      }

      // Fetch recent posts (5-10 posts, excluding featured)
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:authors(*),
          post_categories(category:categories(*)),
          post_tags(tag:tags(*))
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(10);

      if (postsError) {
        console.error("Error fetching recent posts:", postsError);
      }

      if (postsData) {
        const posts = postsData
          .filter((post) => post.id !== featuredData?.id) // Exclude featured post
          .slice(0, 9) // Take up to 9 more posts
          .map((post) => {
            const postData = post as SupabasePost;
            return {
              id: postData.id,
              title: postData.title,
              slug: postData.slug,
              excerpt: postData.excerpt || "",
              coverImageUrl: postData.cover_image_url || undefined,
              publishedAt: postData.published_at || "",
              author: {
                fullName: postData.author?.full_name || "Anonymous",
                avatarUrl: postData.author?.avatar_url || undefined,
              },
              categories: postData.post_categories?.map((pc: PostCategoryRelation) => pc.category) || [],
              tags: postData.post_tags?.map((pt: PostTagRelation) => pt.tag) || [],
            };
          });

        setRecentPosts(posts);
      }
    } catch (error) {
      console.error("Error in fetchPosts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead />
      <OrganizationStructuredData />
      <Header />

      <main className="flex-1">
        {/* Hero Section - Blended with website */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          
          <div className="container relative z-10 py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-on-scroll">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in stagger-1">
                Empowering Communities,<br className="hidden md:block" />
                <span className="md:ml-0"> Transforming Lives</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in stagger-2">
                The Stephen Akintayo Foundation is dedicated to creating lasting change through education,
                sustainable development, and community empowerment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in stagger-3">
                <Link to="/about">
                  <Button size="lg" className="w-full sm:w-auto">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Read Our Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Blog Content */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Featured Post */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : featuredPost ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold">Featured Post</h2>
                    </div>
                    <FeaturedPost {...featuredPost} />
                  </div>
                ) : null}

                {/* Recent Posts */}
                {recentPosts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold">Recent Posts</h2>
                      <Link to="/blog">
                        <Button variant="ghost" size="sm">
                          View All
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recentPosts.map((post) => (
                        <PostCard key={post.id} {...post} />
                      ))}
                    </div>
                  </div>
                )}

                {!loading && recentPosts.length === 0 && !featuredPost && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No posts available yet.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <BlogSidebar />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
