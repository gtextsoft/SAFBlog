import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/_legacy/components/layout/Header";
import { Footer } from "@/_legacy/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewsletterSignup } from "@/_legacy/components/newsletter/NewsletterSignup";
import { PostCard } from "@/_legacy/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SEOHead } from "@/_legacy/components/seo/SEOHead";
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/_legacy/components/seo/StructuredData";
import { SocialShare } from "@/_legacy/components/blog/SocialShare";
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

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [prevPost, setPrevPost] = useState<NavigationPost | null>(null);
  const [nextPost, setNextPost] = useState<NavigationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

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

      const categories = postWithRelations.post_categories?.map((pc: PostCategoryRelation) => pc.category) || [];
      const tags = postWithRelations.post_tags?.map((pt: PostTagRelation) => pt.tag) || [];

      setPost({
        ...postWithRelations,
        categories,
        tags,
      });

      // Extract headings for TOC
      if (postWithRelations.content) {
        const regex = /^(#{2,3})\s+(.+)$/gm;
        const extracted = [];
        let match;
        while ((match = regex.exec(postWithRelations.content)) !== null) {
          extracted.push({
            level: match[1].length,
            text: match[2],
            id: slugify(match[2]),
          });
        }
        setHeadings(extracted);
      }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="flex flex-col min-h-screen bg-background">
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
        {/* Full Width Hero Image */}
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Content */}
            <article className="lg:col-span-8">
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
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight text-foreground">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                    <AvatarFallback>{post.author?.full_name?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{post.author?.full_name}</div>
                    {post.author?.role && (
                      <div className="text-xs text-muted-foreground">{post.author.role}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatReadingTime(readingTime)}</span>
                </div>
              </div>

              {/* Social Share (Mobile only) */}
              <div className="lg:hidden mb-8">
                <SocialShare url={postUrl} title={post.title} description={post.excerpt} />
              </div>

              {/* Content */}
              <div className="prose prose-lg prose-slate max-w-none mb-12 dark:prose-invert 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-p:leading-8 prose-p:text-muted-foreground/90
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 id={slugify(children?.toString() || "")} className="scroll-m-20">{children}</h1>,
                    h2: ({ children }) => <h2 id={slugify(children?.toString() || "")} className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 id={slugify(children?.toString() || "")} className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>,
                    a: ({ href, children }) => (
                      <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                        {children}
                      </a>
                    ),
                    code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string;[key: string]: unknown }) => {
                      const isInline = !className || !className.includes("language-");
                      return isInline ? (
                        <code className="bg-muted px-[0.3rem] py-[0.2rem] rounded font-mono text-sm font-semibold" {...props}>{children}</code>
                      ) : (
                        <code className="block bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props}>{children}</code>
                      );
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {post.tags.map((tag) => (
                    <Link key={tag.slug} to={`/tag/${tag.slug}`}>
                      <Badge variant="outline" className="text-sm py-1 px-3 border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Author Bio Box */}
              {post.author && (
                <div className="bg-card border rounded-xl p-8 mb-12 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                  <Avatar className="h-24 w-24 border-2 border-primary/10">
                    <AvatarImage src={post.author.avatar_url} alt={post.author.full_name} />
                    <AvatarFallback className="text-2xl">{post.author.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2 relative">
                    <div className="absolute top-0 right-0 hidden md:block text-muted-foreground/20">
                      <User className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-bold">{post.author.full_name}</h3>
                    {post.author.role && <p className="text-primary font-medium">{post.author.role}</p>}
                    {post.author.bio && <p className="text-muted-foreground leading-relaxed">{post.author.bio}</p>}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-xl overflow-hidden mb-12">
                <NewsletterSignup source="post_detail" variant="card" />
              </div>

              {/* Navigation */}
              {(prevPost || nextPost) && (
                <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t">
                  {prevPost ? (
                    <Link to={`/blog/${prevPost.slug}`} className="group p-4 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-md">
                      <span className="text-xs text-muted-foreground mb-1 block group-hover:text-primary transition-colors">&larr; Previous</span>
                      <span className="font-semibold line-clamp-2">{prevPost.title}</span>
                    </Link>
                  ) : <div />}
                  {nextPost && (
                    <Link to={`/blog/${nextPost.slug}`} className="group p-4 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-md text-right">
                      <span className="text-xs text-muted-foreground mb-1 block group-hover:text-primary transition-colors">Next &rarr;</span>
                      <span className="font-semibold line-clamp-2">{nextPost.title}</span>
                    </Link>
                  )}
                </nav>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 pl-8">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      Table of Contents
                    </h3>
                    <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {headings.map((heading, index) => (
                        <a
                          key={`${heading.id}-${index}`}
                          href={`#${heading.id}`}
                          className={`
                            block py-1.5 text-sm transition-colors border-l-2 pl-3
                            ${heading.level === 3 ? "ml-4 border-transparent text-muted-foreground hover:text-foreground" : "border-transparent hover:border-primary text-muted-foreground hover:text-primary font-medium"}
                          `}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Share Widget */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Share this story</h3>
                  <SocialShare url={postUrl} title={post.title} description={post.excerpt} />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-muted/30 border-t">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">You might also like</h2>
                <Link to="/blog" className="text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
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
