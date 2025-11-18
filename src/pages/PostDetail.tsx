import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SEOHead } from "@/components/seo/SEOHead";
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { SocialShare } from "@/components/blog/SocialShare";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  full_name: string;
  role?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface PostCategoryRelation {
  category: Category;
}

interface PostTagRelation {
  tag: Tag;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: string;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Author | null;
  categories: Category[];
  tags: Tag[];
  post_categories?: PostCategoryRelation[];
  post_tags?: PostTagRelation[];
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  author: {
    fullName: string;
    avatarUrl?: string | null;
  };
  categories: Category[];
  tags: Tag[];
}

interface NavigationPost {
  id: string;
  slug: string;
  title: string;
  published_at: string | null;
}

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [prevPost, setPrevPost] = useState<NavigationPost | null>(null);
  const [nextPost, setNextPost] = useState<NavigationPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    if (!slug) return;
    
    setLoading(true);

    const { data: postData } = await supabase
      .from("posts")
      .select(`
        *,
        author:authors(*),
        post_categories(category:categories(*)),
        post_tags(tag:tags(*))
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (postData) {
      const postWithRelations = postData as unknown as Post & {
        post_categories?: PostCategoryRelation[];
        post_tags?: PostTagRelation[];
        };

      setPost({
        ...postWithRelations,
        categories: postWithRelations.post_categories?.map((pc: PostCategoryRelation) => pc.category) || [],
        tags: postWithRelations.post_tags?.map((pt: PostTagRelation) => pt.tag) || [],
      });

      // Fetch previous and next posts
      const { data: allPosts } = await supabase
        .from("posts")
        .select("id, slug, title, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (allPosts) {
        const currentIndex = allPosts.findIndex((p) => p.id === postData.id);
        if (currentIndex > 0) {
          setNextPost(allPosts[currentIndex - 1] as NavigationPost);
        }
        if (currentIndex < allPosts.length - 1) {
          setPrevPost(allPosts[currentIndex + 1] as NavigationPost);
        }
      }

      // Fetch related posts by category
      if (postWithRelations.post_categories?.length > 0) {
        const categoryIds = postWithRelations.post_categories.map((pc: PostCategoryRelation) => pc.category.id);

        const { data: related } = await supabase
          .from("posts")
          .select(`
            *,
            author:authors(*),
            post_categories(category:categories(*)),
            post_tags(tag:tags(*))
          `)
          .eq("status", "published")
          .neq("id", postData.id)
          .limit(3);

        if (related) {
          setRelatedPosts(
            related.map((p) => {
              const relatedPost = p as unknown as Post & {
                post_categories?: PostCategoryRelation[];
                post_tags?: PostTagRelation[];
              };
              return {
                id: relatedPost.id,
                title: relatedPost.title,
                slug: relatedPost.slug,
                excerpt: relatedPost.excerpt,
                coverImageUrl: relatedPost.cover_image_url,
                publishedAt: relatedPost.published_at,
                author: {
                  fullName: relatedPost.author?.full_name || "Anonymous",
                  avatarUrl: relatedPost.author?.avatar_url || null,
                },
                categories: relatedPost.post_categories?.map((pc: PostCategoryRelation) => pc.category) || [],
                tags: relatedPost.post_tags?.map((pt: PostTagRelation) => pt.tag) || [],
              };
            })
          );
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useScrollVisibility();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Post Not Found</h1>
            <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const readingTime = post.content ? calculateReadingTime(post.content) : 1;
  const postUrl = `/blog/${post.slug}`;
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    ...(post.categories.length > 0
      ? [{ name: post.categories[0].name, url: `/category/${post.categories[0].slug}` }]
      : []),
    { name: post.title, url: postUrl },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title={post.title}
        description={post.excerpt || post.title}
        image={post.cover_image_url}
        url={postUrl}
        type="article"
        author={post.author?.full_name}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        tags={post.tags.map((tag) => tag.name)}
        canonical={postUrl}
      />
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt || post.title}
        image={post.cover_image_url}
        url={postUrl}
        author={{
          name: post.author?.full_name || "Anonymous",
        }}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        category={post.categories[0]?.name}
        tags={post.tags.map((tag) => tag.name)}
      />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Header />

      <main className="flex-1">
        {/* Hero Image - Full Width */}
        {post.cover_image_url && (
          <div className="w-full relative bg-muted animate-on-scroll">
            <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative overflow-hidden">
              <OptimizedImage
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full"
                objectFit="cover"
                priority={true}
                sizes="100vw"
              />
              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none transition-opacity duration-500" />
            </div>
          </div>
        )}

        <article className="py-12">
          <div className="container max-w-4xl">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/blog">Blog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {post.categories.length > 0 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/category/${post.categories[0].slug}`}>{post.categories[0].name}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Link key={category.slug} to={`/category/${category.slug}`}>
                  <Badge variant="secondary">{category.name}</Badge>
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                  <AvatarFallback>{post.author?.full_name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{post.author?.full_name}</div>
                  {post.author?.role && (
                    <div className="text-sm text-muted-foreground">{post.author.role}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatReadingTime(readingTime)}</span>
              </div>
            </div>

            {/* Social Share */}
            <div className="mb-8 pb-8 border-b">
              <SocialShare url={postUrl} title={post.title} description={post.excerpt} />
            </div>

            {/* Content - Improved Typography */}
            <div className="prose prose-lg prose-slate max-w-none mb-12 dark:prose-invert 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-8 prose-headings:mb-4
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6 prose-h1:font-extrabold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-bold
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold
              prose-p:text-base prose-p:leading-7 prose-p:mb-6 prose-p:text-foreground
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:font-semibold prose-strong:text-foreground
              prose-ul:my-6 prose-ul:pl-6 prose-li:my-2 prose-li:marker:text-primary
              prose-ol:my-6 prose-ol:pl-6
              prose-code:text-sm prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-6
              prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-img:shadow-md prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg
              prose-hr:my-8 prose-hr:border-border
              prose-table:w-full prose-table:my-6 prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:font-semibold prose-td:border prose-td:border-border prose-td:p-3">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-6 text-base leading-7 text-foreground">{children}</p>,
                  h1: ({ children }) => <h1 className="text-3xl font-extrabold mt-10 mb-6 tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 tracking-tight">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3 tracking-tight">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-lg font-semibold mt-6 mb-3 tracking-tight">{children}</h4>,
                  ul: ({ children }) => <ul className="my-6 ml-6 list-disc space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="my-6 ml-6 list-decimal space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-base leading-7">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-6 pr-4 py-2 my-6 italic bg-muted/50 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => {
                    const isInline = !className || !className.includes("language-");
                    if (isInline) {
                      return (
                        <code className="text-sm bg-muted text-foreground px-1.5 py-0.5 rounded font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block text-sm bg-muted text-foreground p-4 rounded-lg overflow-x-auto" {...props}>
                        {children}
                      </code>
                    );
                  },
                  img: ({ src, alt }) => (
                    <OptimizedImage
                      src={src || ""}
                      alt={alt || ""}
                      className="rounded-lg max-w-full mx-auto shadow-md my-8"
                      objectFit="contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                    />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary font-medium no-underline hover:underline transition-colors"
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                  th: ({ children }) => (
                    <th className="border border-border p-3 text-left font-semibold">{children}</th>
                  ),
                  td: ({ children }) => <td className="border border-border p-3">{children}</td>,
                  hr: () => <hr className="my-8 border-border" />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b">
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Link key={tag.slug} to={`/tag/${tag.slug}`}>
                    <Badge variant="outline">{tag.name}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio */}
            {post.author?.bio && (
              <div className="bg-muted/50 rounded-lg p-6 mb-12">
                <h3 className="text-lg font-semibold mb-3">About the Author</h3>
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author.avatar_url} alt={post.author.full_name} />
                    <AvatarFallback className="text-lg">
                      {post.author.full_name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author.full_name}</div>
                    {post.author.role && (
                      <div className="text-sm text-muted-foreground mb-2">{post.author.role}</div>
                    )}
                    <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="bg-gradient-hero text-white rounded-lg p-8 mb-12">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <h3 className="text-2xl font-bold">Stay Updated</h3>
                <p className="text-white/90">
                  Subscribe to our newsletter for more inspiring stories and updates.
                </p>
                <div className="max-w-md mx-auto">
                  <NewsletterSignup source="post_detail" variant="inline" />
                </div>
              </div>
            </div>

            {/* Previous / Next Post Navigation */}
            {(prevPost || nextPost) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 pt-12 border-t">
                {prevPost && (
                  <Link
                    to={`/blog/${prevPost.slug}`}
                    className="group p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ChevronLeft className="h-4 w-4" />
                      Previous Post
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {prevPost.title}
                    </h4>
                  </Link>
                )}
                {nextPost && (
                  <Link
                    to={`/blog/${nextPost.slug}`}
                    className="group p-4 rounded-lg border hover:bg-muted/50 transition-colors md:text-right"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 md:justify-end">
                      Next Post
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {nextPost.title}
                    </h4>
                  </Link>
                )}
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container">
              <h2 className="text-3xl font-bold mb-8 animate-on-scroll">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <div key={relatedPost.id} className="animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                    <PostCard {...relatedPost} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PostDetail;
