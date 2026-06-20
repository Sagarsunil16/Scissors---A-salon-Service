import { Droplet, Palette, Scissors, Smile, Sparkles } from "lucide-react";

const services = [
  {
    name: "Haircut",
    icon: Scissors,
    description: "Precision cuts and styling from trusted professionals.",
  },
  {
    name: "Spa",
    icon: Droplet,
    description: "Restorative treatments designed for a calmer day.",
  },
  {
    name: "Manicure",
    icon: Palette,
    description: "Clean nail care, color, and finishing details.",
  },
  {
    name: "Pedicure",
    icon: Smile,
    description: "Foot care sessions with polished salon standards.",
  },
  {
    name: "Hair Color",
    icon: Sparkles,
    description: "Color consultations, highlights, and complete refreshes.",
  },
];

const PopularServices = () => {
  return (
    <section className="bg-background py-20">
      <div className="section-shell">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Popular services
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Book the essentials without the usual back-and-forth.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.name}
                className="app-surface rounded-lg p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(18,24,27,0.1)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularServices;
