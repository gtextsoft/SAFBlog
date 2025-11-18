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
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group animate-on-scroll">
      <Link to={`/blog/${slug}`}>
        {coverImageUrl && (
          <div className="overflow-hidden">
            <OptimizedImage
              src={coverImageUrl}
              alt={title}
              aspectRatio="video"
              objectFit="cover"
              className="transition-transform duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </Link>

      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`}>
              <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>

        <Link to={`/blog/${slug}`}>
          <h3 className="text-2xl font-bold hover:text-primary transition-all duration-300 line-clamp-2 group-hover:translate-x-1">
            {title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Link key={tag.slug} to={`/tag/${tag.slug}`}>
              <Badge variant="outline" className="text-xs hover:bg-accent transition-colors">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{author.fullName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(publishedAt), "MMM d, yyyy")}</span>
          </div>
          {excerpt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatReadingTime(calculateReadingTime(excerpt))}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
