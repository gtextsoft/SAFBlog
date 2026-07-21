import { SiteFooter } from "@/components/site/SiteFooter";
import { getPromotions } from "@/lib/queries/promotions";

/** Server footer that loads the live footer promotion slot. */
export async function PublicFooter() {
  const [promotion] = await getPromotions("footer", 1);
  return <SiteFooter promotion={promotion ?? null} />;
}
