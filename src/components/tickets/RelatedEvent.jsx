import React from "react";
import { Link } from "react-router-dom";
import OptimizedImage from "../OptimizedImage";

const RelatedEvents = ({ events = [] }) => {

    if (!events.length) return null;

    return (

        <section className="space-y-8">

            <div className="flex justify-between items-center">

                <div>

                    <h2 className="text-3xl font-bold">
                        You May Also Like
                    </h2>

                    <p className="opacity-70">
                        Discover similar events.
                    </p>

                </div>

                <Link
                    to="/event"
                    className="text-orange-500 font-semibold"
                >
                    View all →
                </Link>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                {events.map(event => (

                    <Link
                        key={event.id}
                        to={`/event/${event.slug}`}
                        className="rounded-3xl overflow-hidden border bg-white dark:bg-zinc-900 hover:-translate-y-1 transition"
                    >

                        <OptimizedImage
                            src={event.photo || event.photoURL}
                            className="h-52 w-full object-contain"
                            loading="lazy"
                        />

                        <div className="p-5">

                            <span className="text-xs text-(--primary) uppercase">
                                {event.category}
                            </span>

                            <h3 className="font-bold text-xl mt-2">
                                {event.name}
                            </h3>

                            <p className="mt-2 opacity-70">

                                {event.date &&
                                    new Date(event.date).toLocaleDateString()}

                            </p>

                        </div>

                    </Link>

                ))}

            </div>

        </section>

    );

};

export default RelatedEvents;