import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface PostCardProps {
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

export const PostCard = ({
  title,
  slug,
  excerpt,
  coverImageUrl,
  publishedAt,
  author,
  categories = [],
  tags = [],
}: PostCardProps) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 group animate-on-scroll">
      <Link to={`/blog/${slug}`} className="block relative overflow-hidden aspect-video">
        {coverImageUrl ? (
          <OptimizedImage
            src={coverImageUrl}
            alt={title}
            aspectRatio="video"
            objectFit="cover"
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
      </Link>

      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 2).map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`}>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>

        <Link to={`/blog/${slug}`}>
          <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{excerpt}</p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4 pt-4 mt-auto border-t border-border/50">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-secondary/10 text-secondary">
              <User className="h-3 w-3" />
            </div>
            <span className="font-medium text-foreground">{author.fullName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(publishedAt), "MMM d")}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
