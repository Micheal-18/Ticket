import React from "react";

const SponsorsSection = ({ sponsors = [] }) => {
    const logos = [...sponsors, ...sponsors];
  if (!sponsors.length) return null;

  return (
    <section className="space-y-8">

      <div className="text-center">
        <h2 className="text-3xl font-bold">
          Proudly Sponsored By
        </h2>

        <p className="opacity-70">
          Thanks to our amazing partners.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >

            
            <div className="rounded-3xl border bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) h-36 flex items-center justify-center p-6 hover:shadow-xl transition">

              {sponsor.logo ? (
                <div className="overflow-hidden">
  <div className="flex gap-8 marquee w-max">
    {logos.map((sponsor, index) => (
      <img
        key={index}
        src={sponsor.logo}
        className="h-14 object-contain"
      />
    ))}
  </div>
</div>
              ) : (
                <span className="font-semibold">
                  {sponsor.name}
                </span>
              )}

            </div>
          </a>
        ))}

      </div>

    </section>
  );
};

export default SponsorsSection;