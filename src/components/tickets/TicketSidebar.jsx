import React from "react";

const TicketSidebar = ({
    event,
    tickets,
    children
}) => {

    if (!tickets.length) return null;

    const lowestPrice = Math.min(
        ...tickets.map(ticket => Number(ticket.amount))
    );

    return (

        <aside
            className="
                sticky
                top-24
                space-y-5
            "
        >

            <div
                className="
                    rounded-3xl
                    border
                    bg-white
                    dark:bg-zinc-900
                    p-6
                    shadow-lg
                "
            >

                <p className="text-sm opacity-70">
                    Starting from
                </p>

                <h2 className="text-4xl font-bold text-(--primary)">

                    {event.isFree
                        ? "FREE"
                        : `₦${lowestPrice.toLocaleString()}`}

                </h2>

                <div className="my-6">

                    {children}

                </div>

            </div>

        </aside>

    );

};

export default TicketSidebar;