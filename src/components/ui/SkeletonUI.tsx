import React from 'react'

function SkeletonPage() {
  const line = "h-4 bg-gray-200 rounded w-full animate-pulse";
  const box = "h-40 bg-gray-200 rounded animate-pulse";
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 pb-12">
      <div className="mx-auto pt-36 max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-4">
              <div className={`${line} w-3/4`} />
              <div className={box} />
              <div className={`${line} w-1/3`} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white border shadow-sm rounded-2xl p-4 space-y-4">
                <div className={`${line} w-1/3`} />
                <div className={box} />
              </div>

              <div className="bg-white border shadow-sm rounded-2xl p-4 space-y-4">
                <div className={`${line} w-1/3`} />
                <div className={`${line} w-2/3`} />
                <div className={`${line} w-full`} />
                <div className={`${line} w-1/2`} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default SkeletonPage