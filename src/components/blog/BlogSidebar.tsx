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
      <Card className="animate-on-scroll hover-lift transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="animate-pulse-slow">📧</span>
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
        <Card className="animate-on-scroll hover-lift transition-all duration-300 stagger-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FolderOpen className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={category.id} className="animate-on-scroll" style={{ animationDelay: `${index * 0.05}s` }}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center justify-between group hover:text-primary transition-all duration-300 hover:translate-x-1 rounded-md px-2 py-1 -mx-2 -my-1"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs transition-all duration-300 group-hover:scale-110">
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
        <Card className="animate-on-scroll hover-lift transition-all duration-300 stagger-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Hash className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
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

