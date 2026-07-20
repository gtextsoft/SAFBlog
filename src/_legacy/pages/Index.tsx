import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/_legacy/components/layout/Header";
import { Footer } from "@/_legacy/components/layout/Footer";
import { NewsletterSignup } from "@/_legacy/components/newsletter/NewsletterSignup";
import { PostCard } from "@/_legacy/components/blog/PostCard";
import { FeaturedPost } from "@/_legacy/components/blog/FeaturedPost";
import { BlogSidebar } from "@/_legacy/components/blog/BlogSidebar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/_legacy/components/seo/SEOHead";
import { OrganizationStructuredData } from "@/_legacy/components/seo/StructuredData";
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
        <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center bg-background">
          {/* Dynamic Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background animate-gradient-shift"></div>

          {/* Decorative Blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-5xl mx-auto text-center space-y-8 animate-on-scroll">
              <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide animate-fade-in">
                ✨ Empowering Communities Together
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight animate-fade-in stagger-1">
                Empowering Communities,<br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Transforming Lives</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-2">
                The Stephen Akintayo Foundation is dedicated to creating lasting change through <span className="text-foreground font-semibold">education</span>, <span className="text-foreground font-semibold">sustainable development</span>, and <span className="text-foreground font-semibold">community empowerment</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 animate-fade-in stagger-3">
                <Link to="/about">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:-translate-y-1">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-foreground transition-all duration-300 hover:-translate-y-1">
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
