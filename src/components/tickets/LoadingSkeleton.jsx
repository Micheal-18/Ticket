import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse min-h-screen bg-(--bg-color)">
      <div className="h-72 bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="h-10 w-3/4 rounded bg-(--bg-color) dark:bg-(--bg-color)"></div>

        <div className="flex gap-3">
          <div className="h-6 w-24 rounded-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>
          <div className="h-6 w-20 rounded-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">

          {[1,2,3,4].map(item=>(
            <div
              key={item}
              className="h-28 rounded-2xl bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"
            />
          ))}

        </div>

        <div className="space-y-3">

          <div className="h-6 w-40 rounded bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>

          <div className="h-5 rounded bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>

          <div className="h-5 rounded bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>

          <div className="h-5 w-2/3 rounded bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)"></div>

        </div>

      </div>
    </div>
  );
};

export default LoadingSkeleton;