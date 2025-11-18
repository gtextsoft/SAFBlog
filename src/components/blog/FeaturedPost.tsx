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
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 animate-on-scroll">
      <div className="grid md:grid-cols-2 gap-0">
        {coverImageUrl && (
          <div className="overflow-hidden bg-muted">
            <OptimizedImage
              src={coverImageUrl}
              alt={title}
              aspectRatio="video"
              objectFit="cover"
              className="md:aspect-square transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          </div>
        )}
        <CardContent className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 2).map((category) => (
              <Link key={category.slug} to={`/category/${category.slug}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>

          <Link to={`/blog/${slug}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 hover:text-primary transition-all duration-300 line-clamp-2 group-hover:translate-x-2">
              {title}
            </h2>
          </Link>

          <p className="text-muted-foreground mb-6 line-clamp-3 text-lg">{excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author.avatarUrl} alt={author.fullName} />
                <AvatarFallback>{author.fullName[0]}</AvatarFallback>
              </Avatar>
              <span>{author.fullName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(publishedAt), "MMMM d, yyyy")}</span>
            </div>
          </div>

          <Link to={`/blog/${slug}`}>
            <div className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300 group-hover:text-primary/80">
              Read More
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
};

