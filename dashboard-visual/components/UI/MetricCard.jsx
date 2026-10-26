import React from 'react';

const MetricCard = ({ title, value, change, changeType = 'positive', icon }) => {
  const changeColor = changeType === 'positive' 
    ? 'text-success-500' 
    : changeType === 'negative' 
    ? 'text-error-500' 
    : 'text-gray-500';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {value}
            </h3>
            {change && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className={`text-sm font-medium ${changeColor}`}>
                  {change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  vs mois dernier
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;

