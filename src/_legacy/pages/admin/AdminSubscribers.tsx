import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Download } from "lucide-react";

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setSubscribers(data);
    setLoading(false);
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export");
      return;
    }

    // Create CSV headers
    const headers = ["Email", "Name", "Status", "Source", "Created At"];
    const rows = subscribers.map((sub) => [
      sub.email,
      sub.full_name || "",
      sub.status,
      sub.source || "",
      format(new Date(sub.created_at), "yyyy-MM-dd HH:mm:ss"),
    ]);

    // Escape a value for CSV. Two concerns:
    //  - RFC 4180: a literal " inside a quoted field must be doubled.
    //  - Formula injection: spreadsheet apps execute a cell starting with
    //    = + - @ (or tab/CR), so prefix those with a single quote.
    const escapeCell = (value: string) => {
      const normalized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${normalized.replace(/"/g, '""')}"`;
    };

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Release the blob; without this the object URL leaks for the page's lifetime.
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={subscribers.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{sub.email}</td>
                    <td className="px-4 py-3">{sub.full_name || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sub.status === "subscribed" ? "default" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sub.source || "-"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(sub.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribers;
