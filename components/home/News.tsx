import Image from "next/image";
import { Arrow, Button, TwoTone, linkProps } from "@/components/ui";
import { news } from "@/lib/content";

/* "Latest news": the four newest of the seven posts on the live homepage, each linking to its real post page.
   Card shape follows Virya's latest-news grid: rounded image, title, standfirst. */
export function News() {
  return <section className="news section section-paper" id="news" tabIndex={-1} aria-labelledby="news-title" data-late>
    <div className="wrap">
      <div className="section-head">
        <h2 id="news-title" className="h2" data-reveal="heading"><TwoTone parts={news.title} /></h2>
        <Button href={news.all.href} tone="paper">{news.all.label}</Button>
      </div>
      <ul className="news-grid">
        {news.posts.map((post) => <li key={post.href} data-reveal="card">
          <a href={post.href} className="post" {...linkProps(post.href)}>
            <span className="post-image"><Image src={post.image.src} alt={post.image.alt} width={post.image.w} height={post.image.h} sizes="(min-width: 1100px) 320px, (min-width: 640px) 45vw, 100vw" /></span>
            <time className="post-date" dateTime={post.iso}>{post.date}</time>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-sub">{post.sub}</p>
            <span className="post-more">Read more <Arrow /></span>
          </a>
        </li>)}
      </ul>
    </div>
  </section>;
}
