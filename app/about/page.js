export default function About() {
  return (
    <div>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.pexels.com/photos/37628608/pexels-photo-37628608.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <div className="text-xs tracking-[0.4em] text-accent font-semibold mb-3">OUR STORY</div>
          <h1 className="font-display text-5xl md:text-7xl font-bold">About Jeevikaa</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="font-display text-2xl md:text-3xl italic text-primary leading-relaxed">“Craftsmanship whispered down generations, reimagined for the woman of today.”</p>
          <div className="mt-10 text-base md:text-lg text-foreground/80 leading-relaxed space-y-6 text-left">
            <p>Jeevikaa Couture began as a small atelier in Mumbai in 2015, with a simple belief — that every woman deserves clothes that make her feel truly seen. Today, we work with over 200 artisans across India, from the Banarasi weavers of Varanasi to the mirror-work craftswomen of Kutch.</p>
            <p>Each piece is handcrafted, ethically made, and lovingly finished. We source only the finest fabrics, use age-old techniques passed through generations, and design silhouettes that celebrate the modern Indian woman — her confidence, her heritage, and her joy.</p>
            <p>From bridal lehengas that carry a family's story to everyday kurtis that turn ordinary mornings into rituals, Jeevikaa is where tradition meets today. Welcome to our world.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-16 text-center">
            <div><div className="font-display text-4xl md:text-5xl font-bold text-primary">10K+</div><div className="text-sm text-muted-foreground mt-1">Happy customers</div></div>
            <div><div className="font-display text-4xl md:text-5xl font-bold text-primary">200+</div><div className="text-sm text-muted-foreground mt-1">Master artisans</div></div>
            <div><div className="font-display text-4xl md:text-5xl font-bold text-primary">4.9★</div><div className="text-sm text-muted-foreground mt-1">Average rating</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
