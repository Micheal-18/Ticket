import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const SponsorsSection = ({
  sponsors,
  setSponsors,
}) => {

  const addSponsor = () => {
    setSponsors([
      ...sponsors,
      {
        id: crypto.randomUUID(),
        name: "",
        website: "",
        logo: null,
      },
    ]);
  };

  const updateSponsor = (id, field, value) => {
    setSponsors(
      sponsors.map(sponsor =>
        sponsor.id === id
          ? { ...sponsor, [field]: value }
          : sponsor
      )
    );
  };

  const removeSponsor = id => {
    setSponsors(
      sponsors.filter(sponsor => sponsor.id !== id)
    );
  };

  return (
    <section className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold">
            Sponsors
          </h2>

          <p className="text-xs opacity-70">
            Showcase the brands supporting your event.
          </p>

        </div>

        <button
          type="button"
          onClick={addSponsor}
          className="bg-(--primary) text-white rounded-xl px-5 py-3 flex items-center gap-2"
        >
          <FiPlus />
          Add Sponsor
        </button>

      </div>

      {sponsors.map((sponsor) => (

        <div
          key={sponsor.id}
          className="rounded-3xl border p-6 space-y-5"
        >

          <div className="flex justify-between items-center">

            <h3 className="font-bold">
              {sponsor.name || "New Sponsor"}
            </h3>

            <button
              type="button"
              onClick={() => removeSponsor(sponsor.id)}
              className="text-red-500"
            >
              <FiTrash2 />
            </button>

          </div>

          <div>

            <label className="font-medium">
              Sponsor Name
            </label>

            <input
              value={sponsor.name}
              onChange={(e) =>
                updateSponsor(
                  sponsor.id,
                  "name",
                  e.target.value
                )
              }
              placeholder="Pepsi"
              className="mt-2 w-full rounded-xl border p-4"
            />

          </div>

          <div>

            <label className="font-medium">
              Website (Optional)
            </label>

            <input
              value={sponsor.website}
              onChange={(e) =>
                updateSponsor(
                  sponsor.id,
                  "website",
                  e.target.value
                )
              }
              placeholder="https://pepsi.com"
              className="mt-2 w-full rounded-xl border p-4"
            />

          </div>

          <div>

            <label className="font-medium">
              Sponsor Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateSponsor(
                  sponsor.id,
                  "logo",
                  e.target.files[0]
                )
              }
              className="mt-2 w-full rounded-xl border p-4"
            />

          </div>

          {sponsor.logo && (
            <img
              src={URL.createObjectURL(sponsor.logo)}
              alt=""
              className="w-24 h-24 rounded-xl object-cover border"
            />
          )}

        </div>

      ))}

    </section>
  );
};

export default SponsorsSection;