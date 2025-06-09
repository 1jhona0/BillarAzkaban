import React from 'react';

const Legend = ({ items }) => {
  return (
    <div className="flex flex-wrap justify-center mt-4 space-x-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {item.label} ({item.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;


// DONE