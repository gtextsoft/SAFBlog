import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Save, X, ArrowLeft, Type, Image as ImageIcon, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Author = Tables<"authors">;
type Category = Tables<"categories">;
type Tag = Tables<"tags">;
type PostCategory = Tables<"post_categories">;
type PostTag = Tables<"post_tags">;

interface PostWithRelations {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: string;
  author_id: string | null;
  post_categories?: PostCategory[];
  post_tags?: PostTag[];
}

const AdminPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorRole, setNewAuthorRole] = useState("");
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [showCreateAuthorDialog, setShowCreateAuthorDialog] = useState(false);
  const [creatingAuthor, setCreatingAuthor] = useState(false);
  const [newCategoryNames, setNewCategoryNames] = useState("");
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newTagNames, setNewTagNames] = useState("");
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [authorId, setAuthorId] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchPost = useCallback(async () => {
    if (!id) return;

    const { data: post } = await supabase
      .from("posts")
      .select(`
        *,
        post_categories(category_id),
        post_tags(tag_id)
      `)
      .eq("id", id)
      .single();

    if (post) {
      const postData = post as unknown as PostWithRelations;
      setTitle(postData.title);
      setSlug(postData.slug);
      setExcerpt(postData.excerpt || "");
      setContent(postData.content);
      setCoverImageUrl(postData.cover_image_url || "");
      setStatus(postData.status as "draft" | "published");
      setAuthorId(postData.author_id || "");

      if (postData.post_categories) {
        setSelectedCategories(postData.post_categories.map((pc) => pc.category_id));
      }
      if (postData.post_tags) {
        setSelectedTags(postData.post_tags.map((pt) => pt.tag_id));
      }
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: authorsData } = await supabase.from("authors").select("*").order("full_name");
      if (authorsData) setAuthors(authorsData);

      const { data: categoriesData } = await supabase.from("categories").select("*").order("name");
      if (categoriesData) setCategories(categoriesData);

      const { data: tagsData } = await supabase.from("tags").select("*").order("name");
      if (tagsData) setTags(tagsData);
    };

    fetchData();
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!id && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        const errorMessage = uploadError.message || "";
        if (
          errorMessage.includes("Bucket not found") ||
          errorMessage.includes("bucket") ||
          errorMessage.toLowerCase().includes("404")
        ) {
          throw new Error(
            "Storage bucket 'post-images' not found. Please create it in Supabase Dashboard:\n\n1. Go to Storage section\n2. Click 'Create Bucket'\n3. Name: post-images\n4. Set to Public: Yes\n5. Click Create"
          );
        }
        if (
          errorMessage.toLowerCase().includes("400") ||
          errorMessage.toLowerCase().includes("bad request") ||
          errorMessage.includes("permission") ||
          errorMessage.includes("policy")
        ) {
          throw new Error(
            "Permission denied. The bucket exists but RLS policies are blocking uploads.\n\nPlease configure Storage policies:\n1. Go to Storage → post-images → Policies\n2. Create a policy that allows authenticated users to upload"
          );
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
      toast({
        title: "Image uploaded",
        description: "Cover image uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error &&
        (error.message.includes("Bucket not found") || error.message.includes("bucket"))
          ? "Storage bucket 'post-images' not found. Please create it in Supabase Dashboard: Storage → Create Bucket → Name: 'post-images' → Public: Yes"
          : error instanceof Error
            ? error.message
            : "Failed to upload image.";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a tag name.",
        variant: "destructive",
      });
      return;
    }

    const tagSlug = generateSlug(newTagName.trim());

    // Check if tag with same name or slug already exists
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase() || tag.slug === tagSlug
    );

    if (existingTag) {
      toast({
        title: "Tag already exists",
        description: `A tag with the name "${newTagName.trim()}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    setCreatingTag(true);

    try {
      const { data: newTag, error } = await supabase
        .from("tags")
        .insert({
          name: newTagName.trim(),
          slug: tagSlug,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to tags list
      setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));

      // Automatically select the new tag
      setSelectedTags((prev) => [...prev, newTag.id]);

      toast({
        title: "Tag created",
        description: `Tag "${newTag.name}" has been created and added to this post.`,
      });

      setNewTagName("");
      setShowCreateTagDialog(false);
    } catch (error) {
      console.error("Create tag error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create tag.";
      toast({
        title: "Create tag failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleCreateMultipleTags = async () => {
    if (!newTagNames.trim()) {
      toast({
        title: "Tag names required",
        description: "Please enter tag names separated by commas.",
        variant: "destructive",
      });
      return;
    }

    // Parse comma-separated tags
    const tagNames = newTagNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (tagNames.length === 0) {
      toast({
        title: "Invalid input",
        description: "Please enter at least one valid tag name.",
        variant: "destructive",
      });
      return;
    }

    setCreatingTag(true);

    try {
      const newTags: Tag[] = [];
      const tagsToSelect: string[] = [];

      for (const tagName of tagNames) {
        const tagSlug = generateSlug(tagName);

        // Check if tag already exists
        const existingTag = tags.find(
          (tag) => tag.name.toLowerCase() === tagName.toLowerCase() || tag.slug === tagSlug
        );

        if (existingTag) {
          // If exists, just select it
          if (!selectedTags.includes(existingTag.id)) {
            tagsToSelect.push(existingTag.id);
          }
          continue;
        }

        // Create new tag
        const { data: newTag, error } = await supabase
          .from("tags")
          .insert({
            name: tagName,
            slug: tagSlug,
          })
          .select()
          .single();

        if (error) throw error;

        newTags.push(newTag);
        tagsToSelect.push(newTag.id);
      }

      // Update tags list
      if (newTags.length > 0) {
        setTags((prev) => [...prev, ...newTags].sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Select all new/existing tags
      if (tagsToSelect.length > 0) {
        setSelectedTags((prev) => [...prev, ...tagsToSelect].filter((id, index, self) => self.indexOf(id) === index));
      }

      toast({
        title: "Tags created",
        description: `Created ${newTags.length} new tag(s) and added ${tagsToSelect.length} tag(s) to this post.`,
      });

      setNewTagNames("");
      setShowCreateTagDialog(false);
    } catch (error) {
      console.error("Create tags error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create tags.";
      toast({
        title: "Create tags failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleCreateMultipleCategories = async () => {
    if (!newCategoryNames.trim()) {
      toast({
        title: "Category names required",
        description: "Please enter category names separated by commas.",
        variant: "destructive",
      });
      return;
    }

    // Parse comma-separated categories
    const categoryNames = newCategoryNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (categoryNames.length === 0) {
      toast({
        title: "Invalid input",
        description: "Please enter at least one valid category name.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCategory(true);

    try {
      const newCategories: Category[] = [];
      const categoriesToSelect: string[] = [];

      for (const categoryName of categoryNames) {
        const categorySlug = generateSlug(categoryName);

        // Check if category already exists
        const existingCategory = categories.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase() || cat.slug === categorySlug
        );

        if (existingCategory) {
          // If exists, just select it
          if (!selectedCategories.includes(existingCategory.id)) {
            categoriesToSelect.push(existingCategory.id);
          }
          continue;
        }

        // Create new category
        const { data: newCategory, error } = await supabase
          .from("categories")
          .insert({
            name: categoryName,
            slug: categorySlug,
          })
          .select()
          .single();

        if (error) throw error;

        newCategories.push(newCategory);
        categoriesToSelect.push(newCategory.id);
      }

      // Update categories list
      if (newCategories.length > 0) {
        setCategories((prev) => [...prev, ...newCategories].sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Select all new/existing categories
      if (categoriesToSelect.length > 0) {
        setSelectedCategories((prev) => [...prev, ...categoriesToSelect].filter((id, index, self) => self.indexOf(id) === index));
      }

      toast({
        title: "Categories created",
        description: `Created ${newCategories.length} new category/categories and added ${categoriesToSelect.length} category/categories to this post.`,
      });

      setNewCategoryNames("");
      setShowCreateCategoryDialog(false);
    } catch (error) {
      console.error("Create categories error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create categories.";
      toast({
        title: "Create categories failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) {
      toast({
        title: "Author name required",
        description: "Please enter an author name.",
        variant: "destructive",
      });
      return;
    }

    // Check if author with same name already exists
    const existingAuthor = authors.find(
      (author) => author.full_name.toLowerCase() === newAuthorName.trim().toLowerCase()
    );

    if (existingAuthor) {
      toast({
        title: "Author already exists",
        description: `An author with the name "${newAuthorName.trim()}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    setCreatingAuthor(true);

    try {
      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert({
          full_name: newAuthorName.trim(),
          role: newAuthorRole.trim() || null,
          bio: newAuthorBio.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to authors list
      setAuthors((prev) => [...prev, newAuthor].sort((a, b) => a.full_name.localeCompare(b.full_name)));

      // Automatically select the new author
      setAuthorId(newAuthor.id);

      toast({
        title: "Author created",
        description: `Author "${newAuthor.full_name}" has been created and selected for this post.`,
      });

      setNewAuthorName("");
      setNewAuthorRole("");
      setNewAuthorBio("");
      setShowCreateAuthorDialog(false);
    } catch (error) {
      console.error("Create author error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create author.";
      toast({
        title: "Create author failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingAuthor(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the post.",
        variant: "destructive",
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        title: "Slug required",
        description: "Please enter a slug for the post.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for the post.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const postData: {
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        cover_image_url: string | null;
        status: "draft" | "published";
        author_id: string | null;
        published_at?: string;
      } = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image_url: coverImageUrl || null,
        status,
        author_id: authorId || null,
      };

      if (status === "published" && !id) {
        postData.published_at = new Date().toISOString();
      } else if (status === "published" && id) {
        const { data: existingPost } = await supabase
          .from("posts")
          .select("published_at")
          .eq("id", id)
          .single();
        if (!existingPost?.published_at) {
          postData.published_at = new Date().toISOString();
        }
      }

      let savedPostId: string;

      if (id) {
        const { error } = await supabase.from("posts").update(postData).eq("id", id);
        if (error) throw error;
        savedPostId = id;
      } else {
        const { data, error } = await supabase.from("posts").insert(postData).select().single();
        if (error) throw error;
        savedPostId = data.id;
      }

      if (id) {
        await supabase.from("post_categories").delete().eq("post_id", savedPostId);
      }

      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((categoryId) => ({
          post_id: savedPostId,
          category_id: categoryId,
        }));
        await supabase.from("post_categories").insert(categoryInserts);
      }

      if (id) {
        await supabase.from("post_tags").delete().eq("post_id", savedPostId);
      }

      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map((tagId) => ({
          post_id: savedPostId,
          tag_id: tagId,
        }));
        await supabase.from("post_tags").insert(tagInserts);
      }

      toast({
        title: "Post saved",
        description: `Post ${id ? "updated" : "created"} successfully.`,
      });

      navigate("/admin/posts");
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save post.";
      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = (markdown: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    let newContent = "";
    if (markdown.includes("$SELECTED")) {
      newContent = before + markdown.replace("$SELECTED", selectedText) + after;
    } else {
      newContent = before + markdown + selectedText + after;
    }

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/posts")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold">{id ? "Edit Post" : "New Post"}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted/50">
              <span className="text-sm text-muted-foreground">
                {status === "published" ? "Published" : "Draft"}
              </span>
              <Switch
                checked={status === "published"}
                onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
              />
            </div>

            <Button variant="outline" onClick={() => navigate("/admin/posts")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container px-4 py-6">
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={viewMode === "split" ? "grid grid-cols-2 gap-6" : ""}>
            {/* Edit Panel */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="post-url-slug"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover-image">Cover Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                    aria-label="Upload cover image"
                  />
                  {coverImageUrl && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setCoverImageUrl("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="author">Author</Label>
                  <Dialog open={showCreateAuthorDialog} onOpenChange={setShowCreateAuthorDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Author
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Author</DialogTitle>
                        <DialogDescription>
                          Add a new author to your blog. The author will be available for all posts.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-author-name">Full Name *</Label>
                          <Input
                            id="new-author-name"
                            value={newAuthorName}
                            onChange={(e) => setNewAuthorName(e.target.value)}
                            placeholder="e.g., John Doe"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey && newAuthorName.trim()) {
                                e.preventDefault();
                                handleCreateAuthor();
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-author-role">Role</Label>
                          <Input
                            id="new-author-role"
                            value={newAuthorRole}
                            onChange={(e) => setNewAuthorRole(e.target.value)}
                            placeholder="e.g., Founder & CEO, Content Writer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-author-bio">Bio</Label>
                          <Textarea
                            id="new-author-bio"
                            value={newAuthorBio}
                            onChange={(e) => setNewAuthorBio(e.target.value)}
                            placeholder="Brief biography of the author"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateAuthorDialog(false);
                            setNewAuthorName("");
                            setNewAuthorRole("");
                            setNewAuthorBio("");
                          }}
                          disabled={creatingAuthor}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAuthor} disabled={creatingAuthor || !newAuthorName.trim()}>
                          {creatingAuthor ? "Creating..." : "Create Author"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={authorId || "none"} onValueChange={(value) => setAuthorId(value === "none" ? "" : value)}>
                  <SelectTrigger id="author" aria-label="Select author">
                    <SelectValue placeholder="Select an author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" textValue="No author">No author</SelectItem>
                    {authors.map((author) => (
                      <SelectItem 
                        key={author.id} 
                        value={author.id} 
                        textValue={author.role ? `${author.full_name} (${author.role})` : author.full_name}
                      >
                        {author.full_name}
                        {author.role && ` (${author.role})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {authorId && authors.find((a) => a.id === authorId) && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {authors.find((a) => a.id === authorId)?.full_name}
                    {authors.find((a) => a.id === authorId)?.role && 
                      ` - ${authors.find((a) => a.id === authorId)?.role}`
                    }
                  </p>
                )}
              </div>

              {/* Markdown Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content (Markdown) *</Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Markdown supported</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("# ")}
                    title="Heading 1"
                    className="h-8 px-2"
                  >
                    <span className="font-bold">H1</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("## ")}
                    title="Heading 2"
                    className="h-8 px-2"
                  >
                    <span className="font-semibold">H2</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("### ")}
                    title="Heading 3"
                    className="h-8 px-2"
                  >
                    <span className="font-medium">H3</span>
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("**$SELECTED**")}
                    title="Bold"
                    className="h-8 px-2"
                  >
                    <Type className="h-4 w-4 font-bold" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("*$SELECTED*")}
                    title="Italic"
                    className="h-8 px-2"
                  >
                    <Type className="h-4 w-4 italic" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("~~$SELECTED~~")}
                    title="Strikethrough"
                    className="h-8 px-2"
                  >
                    <span className="line-through text-sm">S</span>
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("- ")}
                    title="Unordered List"
                    className="h-8 px-2"
                  >
                    • List
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("1. ")}
                    title="Ordered List"
                    className="h-8 px-2"
                  >
                    1. List
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("> ")}
                    title="Blockquote"
                    className="h-8 px-2"
                  >
                    " Quote
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("`$SELECTED`")}
                    title="Inline Code"
                    className="h-8 px-2"
                  >
                    {'</>'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("```\n$SELECTED\n```")}
                    title="Code Block"
                    className="h-8 px-2"
                  >
                    {'{ }'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("[$SELECTED](url)")}
                    title="Link"
                    className="h-8 px-2"
                  >
                    Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("![alt](url)")}
                    title="Image"
                    className="h-8 px-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown("---\n")}
                    title="Horizontal Rule"
                    className="h-8 px-2"
                  >
                    ─
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content in Markdown...&#10;&#10;Use the toolbar above for quick formatting, or type Markdown directly."
                  rows={viewMode === "split" ? 25 : 30}
                  className="font-mono text-sm leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Select text and click formatting buttons, or use Markdown syntax directly.
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Categories</Label>
                  <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Categories
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Categories</DialogTitle>
                        <DialogDescription>
                          Add one or more categories separated by commas. Existing categories will be selected automatically.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-category-names">Category Names *</Label>
                          <Textarea
                            id="new-category-names"
                            value={newCategoryNames}
                            onChange={(e) => setNewCategoryNames(e.target.value)}
                            placeholder="e.g., Technology, Health, Finance, Education"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Separate multiple categories with commas (e.g., Technology, Health, Finance)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateCategoryDialog(false);
                            setNewCategoryNames("");
                          }}
                          disabled={creatingCategory}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateMultipleCategories} disabled={creatingCategory || !newCategoryNames.trim()}>
                          {creatingCategory ? "Creating..." : "Create Categories"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[60px]">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No categories available. Create your first category!</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <Label
                          htmlFor={`cat-${category.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tags</Label>
                  <Dialog open={showCreateTagDialog} onOpenChange={setShowCreateTagDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tags
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Tags</DialogTitle>
                        <DialogDescription>
                          Add one or more tags separated by commas. Existing tags will be selected automatically.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-tag-names">Tag Names *</Label>
                          <Textarea
                            id="new-tag-names"
                            value={newTagNames}
                            onChange={(e) => setNewTagNames(e.target.value)}
                            placeholder="e.g., Technology, Health, Finance, Innovation"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Separate multiple tags with commas (e.g., Technology, Health, Finance)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateTagDialog(false);
                            setNewTagNames("");
                          }}
                          disabled={creatingTag}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateMultipleTags} disabled={creatingTag || !newTagNames.trim()}>
                          {creatingTag ? "Creating..." : "Create Tags"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[60px]">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags available. Create your first tag!</p>
                  ) : (
                    tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tag.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Preview Panel (Split View) */}
            {viewMode === "split" && (
              <div className="border-l pl-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
                  <h1>{title || "Untitled Post"}</h1>
                  {excerpt && <p className="text-xl text-muted-foreground">{excerpt}</p>}
                  {coverImageUrl && (
                    <img src={coverImageUrl} alt={title} className="w-full rounded-lg mb-4" />
                  )}
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-6 text-base leading-7">{children}</p>,
                      h1: ({ children }) => <h1 className="text-3xl font-extrabold mt-10 mb-6">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt} className="rounded-lg max-w-full my-8" />
                      ),
                    }}
                  >
                    {content || "*No content yet*"}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Preview Mode */}
        {viewMode === "preview" && (
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
              <h1>{title || "Untitled Post"}</h1>
              {excerpt && <p className="text-xl text-muted-foreground">{excerpt}</p>}
              {coverImageUrl && (
                <img src={coverImageUrl} alt={title} className="w-full rounded-lg mb-4" />
              )}
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-6 text-base leading-7">{children}</p>,
                  h1: ({ children }) => <h1 className="text-3xl font-extrabold mt-10 mb-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt} className="rounded-lg max-w-full my-8" />
                  ),
                }}
              >
                {content || "*No content yet*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPostEditor;

