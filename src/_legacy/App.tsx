import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Newsletter from "./pages/Newsletter";
import PostDetail from "./pages/PostDetail";
import CategoryPosts from "./pages/CategoryPosts";
import TagPosts from "./pages/TagPosts";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import Sitemap from "./pages/Sitemap";
import { PageTransition } from "./components/layout/PageTransition";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<PostDetail />} />
        <Route path="/category/:slug" element={<CategoryPosts />} />
        <Route path="/tag/:slug" element={<TagPosts />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/sitemap.xml" element={<Sitemap />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<AdminPostEditor />} />
          <Route path="posts/edit/:id" element={<AdminPostEditor />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="newsletter" element={<AdminSubscribers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
