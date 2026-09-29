import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, MessageCircle, PackageSearch, RotateCcw } from "lucide-react";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { listBestSellers, listBuyAgain, listByCategory, listCategories, listFresh, listOffers } from "@/lib/catalog";
import { HeroSlider } from "@/components/shop/HeroSlider";
import { Countdown } from "@/components/shop/Countdown";
import { ProductRail, SectionHead } from "@/components/shop/Section";
import { CategoryCircles } from "@/components/shop/CategoryCircles";
import { CatIcon } from "@/components/ui/Icon";
import { Mark } from "@/components/ui/Logo";
import { Illus } from "@/components/ui/Illustrations";
import { num } from "@/lib/format";

export default async function Home() {
  const user = await getCurrentUser();
  const [banners, cats, offers, best, fresh, s, again] = await Promise.all([
    db.select().from(schema.banners).where(eq(schema.banners.active, true)).orderBy(asc(schema.banners.sort)),
    listCategories(),
    listOffers(12),
    listBestSellers(12),
    listFresh(12),
    getSettings(),
    user ? listBuyAgain(user.id, 12) : Promise.resolve([]),
  ]);
  const railCats = cats.filter((c) => ["dairy-eggs", "aleppo-pantry", "grains-legumes", "snacks-sweets", "cleaning"].includes(c.slug));
  const rails = await Promise.all(railCats.map(async (c) => ({ c, items: await listByCategory(c.id, 12) })));

  return (
    <div>
      <HeroSlider banners={banners} />

      {/* Categories — circles on phones, tiles on desktop */}
      <section className="container-x mt-6 md:mt-12">
        <div className="md:hidden"><CategoryCircles cats={cats} /></div>
        <div className="hidden md:block">
          <SectionHead title="تسوّق حسب القسم" sub="كل شي بتحتاجه لبيتك.. بمكان واحد" href="/categories" />
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-7 stagger">
            {cats.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl p-3 ring-1 ring-black/[.04] transition duration-300 hover:-translate-y-1 hover:shadow-card" style={{ background: c.tint }}>
                <span className="relative z-10 text-sm font-black leading-tight text-ink">{c.name}</span>
                <span className="relative z-10 text-[11px] font-bold text-ink-mute">{c.count} منتج</span>
                {c.image ? (
                  <div className="absolute inset-x-3 bottom-3 top-[42%] overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${c.image}?w=360&h=300&fit=crop&auto=format&q=70`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                ) : (
                  <span className="absolute bottom-4 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-2xl bg-white text-brand-600 shadow-card transition group-hover:scale-110">
                    <CatIcon name={c.icon} className="h-8 w-8" strokeWidth={1.8} />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Buy again (logged-in) */}
      {again.length > 0 && (
        <section className="container-x mt-8 md:mt-14">
          <SectionHead title="اطلب مرة تانية" sub="الأغراض اللي بتطلبها عادةً — بكبسة وحدة" extra={<RotateCcw className="h-5 w-5 text-brand-600" />} />
          <ProductRail products={again} />
        </section>
      )}

      {/* Daily offers */}
      {offers.length > 0 && (
        <section className="container-x mt-8 md:mt-14">
          <div className="-mx-4 bg-white px-4 py-5 ring-1 ring-ink-line sm:mx-0 sm:rounded-[2rem] sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black sm:text-[28px]"><span className="h-7 w-1.5 rounded-full bg-brand-600" />عروض اليوم</h2>
                <p className="mt-1 text-xs text-ink-mute sm:text-sm">تنتهي منتصف الليل</p>
              </div>
              <Countdown />
            </div>
            <ProductRail products={offers} />
            <Link href="/offers" className="mt-4 flex items-center justify-center gap-1 rounded-2xl bg-brand-50 py-3 text-sm font-black text-brand-700">كل العروض <ArrowLeft className="h-4 w-4" /></Link>
          </div>
        </section>
      )}

      {/* Fresh produce */}
      {fresh.length > 0 && (
        <section className="container-x mt-8 md:mt-14">
          <div className="relative mb-5 overflow-hidden rounded-[1.75rem] bg-[#EAF7EE] p-5 sm:p-7">
            <div className="relative z-10 max-w-[62%]">
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-emerald-700">طازج كل صباح</span>
              <h2 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">خضرة وفواكه<br />من سوق الهال لبيتك</h2>
              <p className="mt-2 text-xs font-bold text-ink-soft sm:text-sm">اختار ½ كيلو أو كيلو — منوزن الك بالمضبوط</p>
            </div>
            <Illus.Fresh className="absolute -bottom-3 -left-3 h-40 w-44 sm:h-56 sm:w-64" />
          </div>
          <ProductRail products={fresh} />
          <Link href="/category/vegetables-fruits" className="mt-3 flex items-center justify-center gap-1 py-2 text-sm font-black text-emerald-700 md:hidden">كل الخضار والفواكه <ArrowLeft className="h-4 w-4" /></Link>
        </section>
      )}

      {/* Brand band */}
      <section className="container-x mt-8 md:mt-14">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-600 p-6 text-white sm:rounded-[2rem] sm:p-12">
          <div className="stripes absolute inset-0 opacity-50" />
          <Illus.Scooter className="absolute -bottom-2 -left-6 h-36 w-52 opacity-95 sm:left-6 sm:h-60 sm:w-80" />
          <div className="relative max-w-[60%] sm:max-w-xl">
            <h2 className="text-2xl font-black leading-tight sm:text-5xl">طلباتك كتيرة؟<br />الحل عنا!</h2>
            <p className="mt-3 text-sm text-white/85 sm:text-lg">ابعتلنا ليستة أغراضك على واتساب، أو عبّي سلتك من هون — ونحنا منجهّزها ومنوصّلها.</p>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("مرحباً، بدي ابعتلكن ليستة أغراض:")}`} target="_blank" rel="noreferrer" className="btn h-11 bg-white px-4 text-sm text-brand-700 hover:bg-brand-50 sm:h-14 sm:px-6 sm:text-base">
                <MessageCircle className="h-5 w-5" /> ابعت الليستة
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-x mt-8 md:mt-14">
        <SectionHead title="الأكثر طلباً بحلب" sub="اللي الكل عم يطلبه هالأسبوع" />
        <ProductRail products={best} />
      </section>

      {/* Category rails */}
      {rails.map(({ c, items }) => items.length > 0 && (
        <section key={c.id} className="container-x mt-8 md:mt-14">
          <SectionHead title={c.name} href={`/category/${c.slug}`} />
          <ProductRail products={items} />
        </section>
      ))}

      {/* Loyalty + tracking */}
      <section className="container-x mt-8 grid gap-4 md:mt-14 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white sm:p-8">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-600/30 blur-2xl" />
          <Illus.Gift className="absolute -bottom-2 left-2 h-28 w-28 sm:h-36 sm:w-36" />
          <div className="relative max-w-[70%]">
            <h3 className="text-xl font-black sm:text-2xl">نقاط عمار — كل طلبية بترجعلك</h3>
            <p className="mt-2 text-sm text-white/75">كل {num(s.pointsPerAmount)} ل.س = نقطة، وكل نقطة = {num(s.pointValue)} ل.س خصم على طلبك الجاي.</p>
            <Link href={user ? "/account" : "/register"} className="btn mt-5 h-11 bg-white px-5 text-sm text-ink hover:bg-brand-50">{user ? `عندك ${num(user.points)} نقطة` : "افتح حسابك واربح 20 نقطة"}</Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 ring-1 ring-ink-line sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><PackageSearch className="h-6 w-6" /></span>
          <h3 className="mt-4 text-xl font-black sm:text-2xl">وين وصل طلبي؟</h3>
          <p className="mt-2 text-sm text-ink-mute">تابع كل مرحلة لحظة بلحظة — من التجهيز لحد باب البيت.</p>
          <Link href="/track" className="btn-dark mt-5 h-11 text-sm">تتبّع طلبك</Link>
        </div>
      </section>

      <div className="container-x mt-10 flex items-center justify-center gap-2 text-xs font-bold text-ink-mute md:hidden"><Mark className="h-5 w-5" /> عمار للتسوق — احسبها صح</div>
    </div>
  );
}
