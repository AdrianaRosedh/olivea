import { redirect } from "next/navigation";

// Promotions is handled by Banners + Popups under the content hub.
// Redirect to the content hub which has both.
export default function PromotionsPage() {
  redirect("/admin/content-hub");
}
