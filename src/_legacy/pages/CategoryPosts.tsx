import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

const CategoryPosts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndPosts();
    }
  }, [slug]);

  useScrollVisibility();

  const fetchCategoryAndPosts = async () => {
    setLoading(true);

    // Fetch category
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (categoryData) {
      setCategory(categoryData);

      // Fetch posts in this category
      const { data: postCategories } = await supabase
        .from("post_categories")
        .select("post_id")
        .eq("category_id", categoryData.id);

      if (postCategories && postCategories.length > 0) {
        const postIds = postCategories.map((pc) => pc.post_id);

        const { data: postsData } = await supabase
          .from("posts")
          .select(`
            *,
            author:authors(*),
            post_categories(category:categories(*)),
            post_tags(tag:tags(*))
          `)
          .in("id", postIds)
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (postsData) {
          setPosts(
            postsData.map((post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              coverImageUrl: post.cover_image_url,
              publishedAt: post.published_at,
              author: {
                fullName: post.author?.full_name || "Anonymous",
                avatarUrl: post.author?.avatar_url,
              },
              categories: post.post_categories?.map((pc: any) => pc.category) || [],
              tags: post.post_tags?.map((pt: any) => pt.tag) || [],
            }))
          );
        }
      }
    }

    setLoading(false);
  };

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

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Category Not Found</h1>
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

  const categoryUrl = `/category/${category.slug}`;
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: category.name, url: categoryUrl },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title={category.name}
        description={category.description || `Posts in ${category.name} category`}
        url={categoryUrl}
      />
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="gradient-hero text-white py-16">
          <div className="container">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-white/80 hover:text-white">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/50" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/blog" className="text-white/80 hover:text-white">Blog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{category.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-xl text-white/90">{category.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12">
          <div className="container">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts in this category yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPosts;
