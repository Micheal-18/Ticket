import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse min-h-screen bg-(--bg-color)">
      <div className="h-72 bg-gray-300 dark:bg-zinc-800"></div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="h-10 w-3/4 rounded bg-gray-300 dark:bg-zinc-800"></div>

        <div className="flex gap-3">
          <div className="h-6 w-24 rounded-full bg-gray-300 dark:bg-zinc-800"></div>
          <div className="h-6 w-20 rounded-full bg-gray-300 dark:bg-zinc-800"></div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">

          {[1,2,3,4].map(item=>(
            <div
              key={item}
              className="h-28 rounded-2xl bg-gray-300 dark:bg-zinc-800"
            />
          ))}

        </div>

        <div className="space-y-3">

          <div className="h-6 w-40 rounded bg-gray-300 dark:bg-zinc-800"></div>

          <div className="h-5 rounded bg-gray-300 dark:bg-zinc-800"></div>

          <div className="h-5 rounded bg-gray-300 dark:bg-zinc-800"></div>

          <div className="h-5 w-2/3 rounded bg-gray-300 dark:bg-zinc-800"></div>

        </div>

      </div>
    </div>
  );
};

export default LoadingSkeleton;