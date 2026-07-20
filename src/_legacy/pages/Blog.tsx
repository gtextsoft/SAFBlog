import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/_legacy/components/layout/Header";
import { Footer } from "@/_legacy/components/layout/Footer";
import { PostCard } from "@/_legacy/components/blog/PostCard";
import { FeaturedPost } from "@/_legacy/components/blog/FeaturedPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import { SEOHead } from "@/_legacy/components/seo/SEOHead";
import { BlogStructuredData, OrganizationStructuredData } from "@/_legacy/components/seo/StructuredData";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

const POSTS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
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

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useScrollVisibility();

  const fetchPosts = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);

    try {
      // Collect post IDs that match filters - run filter queries in parallel for better performance
      let filteredPostIds: string[] | null = null;

      // Run category and tag filter queries in parallel if needed
      const categoryPromise = selectedCategory !== "all"
        ? supabase.from("post_categories").select("post_id").eq("category_id", selectedCategory)
        : Promise.resolve({ data: null as Array<{ post_id: string }> | null, error: null });

      const tagPromise = selectedTags.length > 0
        ? supabase.from("post_tags").select("post_id").in("tag_id", selectedTags)
        : Promise.resolve({ data: null as Array<{ post_id: string }> | null, error: null });

      // Wait for all filter queries to complete in parallel
      const [categoryResult, tagResult] = await Promise.all([categoryPromise, tagPromise]);

      // Process category filter results
      if (selectedCategory !== "all") {
        if (categoryResult.error) {
          console.error("Error fetching post categories:", categoryResult.error);
        } else if (categoryResult.data && categoryResult.data.length > 0) {
          filteredPostIds = categoryResult.data.map((pc) => pc.post_id);
        } else {
          // No posts in this category
          setPosts([]);
          setTotalPosts(0);
          setLoading(false);
          return;
        }
      }

      // Process tag filter results
      if (selectedTags.length > 0) {
        if (tagResult.error) {
          console.error("Error fetching post tags:", tagResult.error);
        } else if (tagResult.data && tagResult.data.length > 0) {
          const tagPostIds: string[] = Array.from(new Set(tagResult.data.map((pt: { post_id: string }) => pt.post_id)));

          if (filteredPostIds) {
            // Find intersection: posts that match both category AND tags
            filteredPostIds = filteredPostIds.filter((id) => tagPostIds.includes(id));
          } else {
            filteredPostIds = tagPostIds;
          }

          if (filteredPostIds.length === 0) {
            // No posts match filters
            setPosts([]);
            setTotalPosts(0);
            setLoading(false);
            return;
          }
        } else {
          // No posts with these tags
          setPosts([]);
          setTotalPosts(0);
          setLoading(false);
          return;
        }
      }

      // Build optimized query - combine count and data in single request where possible
      let dataQuery = supabase
        .from("posts")
        .select(
          `
          *,
          author:authors(*),
          post_categories(category:categories(*)),
          post_tags(tag:tags(*))
        `,
          { count: "exact" }
        )
        .eq("status", "published");

      // Apply filtered post IDs if we have any
      if (filteredPostIds && filteredPostIds.length > 0) {
        dataQuery = dataQuery.in("id", filteredPostIds);
      }

      // Apply search filter
      if (debouncedSearchQuery) {
        // PostgREST parses `.or()` as a comma/parenthesis-delimited expression,
        // so raw input would let a user rewrite the filter. Escape the PostgREST
        // metacharacters and the SQL LIKE wildcards before interpolating.
        const term = debouncedSearchQuery
          .replace(/[\\%_]/g, (c) => `\\${c}`)
          .replace(/[,()."]/g, " ")
          .trim();

        if (term) {
          dataQuery = dataQuery.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
        }
      }

      // Apply ordering
      dataQuery = dataQuery.order("published_at", { ascending: false });

      // Apply pagination and fetch data
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      const { data, error, count } = await dataQuery.range(from, to);

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        setTotalPosts(0);
      } else if (data) {
        // Process posts
        const processedPosts = data.map((post) => {
          const postData = post as unknown as SupabasePost;
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

        setPosts(processedPosts);
        setTotalPosts(count || 0);
      } else {
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error: unknown) {
      // Ignore aborted errors
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        return;
      }
      console.error("Error in fetchPosts:", error);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [selectedCategory, selectedTags, debouncedSearchQuery, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, debouncedSearchQuery, selectedTags]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, debouncedSearchQuery, selectedTags, currentPage, fetchPosts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) {
        console.error("Error fetching categories:", error);
      } else if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) {
        console.error("Error fetching tags:", error);
      } else if (data) {
        setTags(data);
      }
    } catch (error) {
      console.error("Error in fetchTags:", error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTags([]);
    setSearchQuery("");
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Our Blog"
        description="Stories of impact, insights on development, and updates from the Stephen Akintayo Foundation"
        url="/blog"
      />
      <BlogStructuredData />
      <OrganizationStructuredData />
      <Header />

      <main className="flex-1">
        {/* Hero Section - Blended with website */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

          <div className="container relative z-10 py-16 md:py-20">
            <div className="max-w-2xl mx-auto text-center space-y-6 animate-on-scroll">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in">Our Blog</h1>
              <p className="text-lg md:text-xl text-muted-foreground animate-fade-in stagger-1">
                Stories of impact, insights on development, and updates from the field
              </p>
            </div>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-10">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading stats...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-12">
                  {/* Featured Post (First post) */}
                  {currentPage === 1 && posts.length > 0 && (
                    <div className="mb-12 animate-fade-in">
                      <FeaturedPost {...posts[0]} />
                    </div>
                  )}

                  {/* Recent Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.slice(currentPage === 1 ? 1 : 0).map((post) => (
                      <div key={post.id} className="animate-float">
                        <PostCard {...post} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center pt-8 border-t">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page);
                                    }}
                                    isActive={currentPage === page}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 border rounded-lg bg-muted/30">
                  <p className="text-lg text-muted-foreground">No posts found matching your criteria.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                {/* Search Widget */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Search
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories Widget */}
                {categories.length > 0 && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Categories</h3>
                    <div className="space-y-2">
                      <div
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedCategory === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                          }`}
                        onClick={() => setSelectedCategory("all")}
                      >
                        <span>All Stories</span>
                        {/* We could show total count here if available */}
                      </div>
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedCategory === category.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                            }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <span>{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Widget */}
                {tags.length > 0 && (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "secondary"}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    {(selectedCategory !== "all" || selectedTags.length > 0 || searchQuery) && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full mt-6">
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}

                {/* Newsletter Widget Placeholder - Could be a component */}
                <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold mb-2">Join Our Community</h3>
                  <p className="text-primary-foreground/90 text-sm mb-4">
                    Get the latest stories delivered to your inbox.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Subscribe Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
