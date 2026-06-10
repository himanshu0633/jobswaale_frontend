import React from 'react';

const ResponsiveCardList = ({ items = [], renderCard, emptyMessage = 'No items found.' }) => {
  if (!renderCard) return null;

  return (
    <div className="space-y-3 md:hidden">
      {items.length === 0 ? (
        <div className="p-4 text-center text-slate-400">{emptyMessage}</div>
      ) : (
        items.map((it, idx) => (
          <div key={it._id || idx} className="bg-white border border-slate-200 rounded-lg p-3">
            {renderCard(it, idx)}
          </div>
        ))
      )}
    </div>
  );
};

export default ResponsiveCardList;
