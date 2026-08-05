export default function About() {
  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.pexels.com/photos/37628608/pexels-photo-37628608.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <div className="text-xs tracking-[0.4em] text-accent font-semibold mb-3">OUR STORY</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold">About Us</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 font-display italic">Where Elegance Becomes Legacy.</p>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="font-display text-2xl md:text-3xl italic text-primary leading-relaxed">Every brand has a story. Jeevikaa Couture has a heartbeat.</p>
          <div className="mt-10 text-base md:text-lg text-foreground/80 leading-relaxed space-y-6 text-left">
            <p>Founded by Priyanka Kaushik, Jeevikaa Couture is more than a fashion label—it’s a mother’s dream brought to life. Inspired by her daughter, Jeevikaa, the brand was created as a symbol of love, hope, and the desire to build a legacy that would inspire generations.</p>
            <p>For Priyanka, fashion has always been about more than beautiful clothing. It is about creating pieces that make every woman feel confident, graceful, and truly herself. With this vision, she set out to build a brand where every outfit is designed with care, crafted with precision, and finished with timeless elegance.</p>
            <p>At Jeevikaa Couture, every collection reflects a perfect blend of premium fabrics, thoughtful craftsmanship, and contemporary design while honoring the beauty of Indian traditions. Every stitch tells a story of dedication, every silhouette celebrates individuality, and every creation is made with love.</p>
            <p>What began as a mother’s tribute to her daughter has become a brand that celebrates women from every walk of life. Through Jeevikaa Couture, Priyanka Kaushik hopes to bring confidence, elegance, and joy to every wardrobe while building a legacy inspired by the name that means the most to her—Jeevikaa.</p>
            <p>Welcome to Jeevikaa Couture, where fashion is created with heart, inspired by love, and designed to become a timeless part of your story.</p>
          </div>
          <div className="mt-16 pt-10 border-t border-primary-100">
            <div className="font-display text-3xl md:text-4xl font-bold text-primary">Jeevikaa Couture</div>
            <div className="text-sm tracking-[0.25em] text-muted-foreground mt-2 uppercase">Where Elegance Becomes Legacy.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
