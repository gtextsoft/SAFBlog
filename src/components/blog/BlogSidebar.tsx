import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { supabase } from "@/integrations/supabase/client";
import { Hash, FolderOpen } from "lucide-react";

export const BlogSidebar = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchPopularTags();
  }, []);

  const fetchCategories = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (categoriesData) {
      // Get post counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          // Get published posts count for this category
          const { data: postCategories } = await supabase
            .from("post_categories")
            .select("post_id")
            .eq("category_id", category.id);

          if (postCategories && postCategories.length > 0) {
            const postIds = postCategories.map((pc) => pc.post_id);
            const { count: publishedCount } = await supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .in("id", postIds)
              .eq("status", "published");

            return { ...category, postCount: publishedCount || 0 };
          }

          return { ...category, postCount: 0 };
        })
      );

      setCategories(categoriesWithCounts.filter((c) => c.postCount > 0));
    }
  };

  const fetchPopularTags = async () => {
    // Get all tags with their post counts
    const { data: tagsData } = await supabase.from("tags").select("*").order("name");

    if (tagsData) {
      const tagsWithCounts = await Promise.all(
        tagsData.map(async (tag) => {
          const { data: postTags } = await supabase
            .from("post_tags")
            .select("post_id")
            .eq("tag_id", tag.id);

          if (postTags && postTags.length > 0) {
            const postIds = postTags.map((pt) => pt.post_id);
            const { count: publishedCount } = await supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .in("id", postIds)
              .eq("status", "published");

            return { ...tag, postCount: publishedCount || 0 };
          }

          return { ...tag, postCount: 0 };
        })
      );

      // Sort by post count and take top 10
      const popularTags = tagsWithCounts
        .filter((t) => t.postCount > 0)
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 10);

      setTags(popularTags);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Newsletter Signup */}
      <Card className="animate-on-scroll hover-lift transition-all duration-300 border-none bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <span className="animate-bounce">📧</span>
            Stay Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get the latest posts and updates delivered to your inbox.
          </p>
          <NewsletterSignup source="home_sidebar" variant="compact" />
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="animate-on-scroll hover-lift transition-all duration-300 stagger-1 shadow-md hover:shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FolderOpen className="h-4 w-4" />
              </div>
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={category.id} className="animate-on-scroll" style={{ animationDelay: `${index * 0.05}s` }}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center justify-between group hover:bg-secondary/5 transition-all duration-300 rounded-lg px-3 py-2 -mx-2"
                  >
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">{category.name}</span>
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {category.postCount}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Popular Tags */}
      {tags.length > 0 && (
        <Card className="animate-on-scroll hover-lift transition-all duration-300 stagger-2 shadow-md hover:shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Hash className="h-4 w-4" />
              </div>
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.slug}`}
                  className="group animate-on-scroll"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <Badge
                    variant="outline"
                    className="text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    {tag.name}
                    <span className="ml-1 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300">
                      ({tag.postCount})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

