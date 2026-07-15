import React from "react";

const colors = [
  "#F59E0B",
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#ec4899",
  "#111827",
];

const layouts = [
  "Modern",
  "Minimal",
  "Glass",
];

const buttons = [
  "Rounded",
  "Square",
  "Pill",
];

const animations = [
  "None",
  "Fade",
  "Slide",
];

const ThemeSection = ({
  theme,
  setTheme,
}) => {

  const update = (field, value) => {

    setTheme({
      ...theme,
      [field]: value,
    });

  };

  return (

    <section className="space-y-8">

      <div>

        <h2 className="text-2xl font-bold">
          Event Branding
        </h2>

        <p className="text-xs opacity-70">
          Customize how attendees experience your event page.
        </p>

      </div>

      {/* Accent */}

      <div>

        <label className="font-semibold">
          Accent Color
        </label>

        <div className="flex flex-wrap gap-4 mt-4">

          {colors.map(color=>(

            <button
              key={color}
              type="button"
              onClick={()=>update("accent",color)}
              className={`w-12 h-12 rounded-full border-4 transition ${
                theme.accent===color
                  ? "border-black dark:border-white scale-110"
                  : "border-transparent"
              }`}
              style={{
                background:color
              }}
            />

          ))}

        </div>

      </div>

      {/* Layout */}

      <div>

        <label className="font-semibold">
          Layout Style
        </label>

        <div className="grid md:grid-cols-3 gap-4 mt-4">

          {layouts.map(layout=>(

            <button
              key={layout}
              type="button"
              onClick={()=>update("layout",layout)}
              className={`rounded-2xl border p-5 transition ${
                theme.layout===layout
                ?"bg-(--primary) text-white border-(--primary)"
                :""
              }`}
            >

              {layout}

            </button>

          ))}

        </div>

      </div>

      {/* Button */}

      <div>

        <label className="font-semibold">
          Button Style
        </label>

        <div className="grid md:grid-cols-3 gap-4 mt-4">

          {buttons.map(btn=>(

            <button
              key={btn}
              type="button"
              onClick={()=>update("button",btn)}
              className={`rounded-2xl border p-5 transition ${
                theme.button===btn
                ?"bg-(--primary) text-white border-(--primary)"
                :""
              }`}
            >

              {btn}

            </button>

          ))}

        </div>

      </div>

      {/* Animation */}

      <div>

        <label className="font-semibold">
          Page Animation
        </label>

        <div className="grid md:grid-cols-3 gap-4 mt-4">

          {animations.map(animation=>(

            <button
              key={animation}
              type="button"
              onClick={()=>update("animation",animation)}
              className={`rounded-2xl border p-5 transition ${
                theme.animation===animation
                ?"bg-(--primary) text-white border-(--primary)"
                :""
              }`}
            >

              {animation}

            </button>

          ))}

        </div>

      </div>

    </section>

  );
};

export default ThemeSection;