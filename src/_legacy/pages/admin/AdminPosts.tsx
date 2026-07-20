import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const AdminPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*, author:authors(*)")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const handleNewPost = () => {
    navigate("/admin/posts/new");
  };

  const handleEditPost = (postId: string) => {
    navigate(`/admin/posts/edit/${postId}`);
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", deletingPostId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleViewPost = (slug: string) => {
    window.open(`/blog/${slug}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground mt-1">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Button onClick={handleNewPost}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Published</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No posts yet. Create your first post!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{post.author?.full_name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {post.published_at
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPost(post.slug)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPostId(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingPostId !== null} onOpenChange={() => setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPosts;
