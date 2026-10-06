import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorTheme = 'default' }) {
  let cardClass = 'card';
  let valueColor = '#09090b';

  if (colorTheme === 'blue') {
    cardClass += ' stat-card-blue';
    valueColor = '#2563eb';
  } else if (colorTheme === 'yellow') {
    cardClass += ' stat-card-yellow';
    valueColor = '#d97706';
  } else if (colorTheme === 'green') {
    cardClass += ' stat-card-green';
    valueColor = '#16a34a';
  } else if (colorTheme === 'red') {
    cardClass += ' stat-card-red';
    valueColor = '#dc2626';
  }

  return (
    <div className={cardClass}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ color: valueColor }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-value" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}
