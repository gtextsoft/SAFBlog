import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface FeaturedPostProps {
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
  categories?: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
}

export const FeaturedPost = ({
  title,
  slug,
  excerpt,
  coverImageUrl,
  publishedAt,
  author,
  categories = [],
  tags = [],
}: FeaturedPostProps) => {
  return (
    <Card className="overflow-hidden group border-none shadow-xl bg-card hover:shadow-2xl transition-all duration-500 ease-in-out hover:-translate-y-1 animate-on-scroll ring-1 ring-border/50">
      <div className="grid md:grid-cols-2 gap-0 relative">
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-primary text-white hover:bg-primary/90 shadow-lg backdrop-blur-md">
            ✨ Featured Story
          </Badge>
        </div>

        {coverImageUrl ? (
          <Link to={`/blog/${slug}`} className="block relative overflow-hidden h-full min-h-[300px] md:min-h-full">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
            <OptimizedImage
              src={coverImageUrl}
              alt={title}
              aspectRatio="square"
              objectFit="cover"
              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          </Link>
        ) : (
          <div className="bg-muted w-full h-full min-h-[300px] flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}

        <CardContent className="p-8 md:p-12 flex flex-col justify-center relative bg-gradient-to-br from-card via-card/50 to-secondary/5">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.slice(0, 2).map((category) => (
              <Link key={category.slug} to={`/category/${category.slug}`}>
                <Badge variant="outline" className="border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>

          <Link to={`/blog/${slug}`}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 hover:text-primary transition-colors duration-300 leading-tight">
              {title}
            </h2>
          </Link>

          <p className="text-muted-foreground mb-8 line-clamp-3 text-lg leading-relaxed">{excerpt}</p>

          <div className="flex items-center gap-6 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={author.avatarUrl} alt={author.fullName} />
                <AvatarFallback className="bg-primary/5 text-primary">{author.fullName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{author.fullName}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(publishedAt), "MMM d, yyyy")}</span>
              </div>
            </div>

            <div className="ml-auto">
              <Link to={`/blog/${slug}`}>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

