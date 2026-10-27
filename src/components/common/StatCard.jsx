import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon, color = 'var(--color-secondary)' }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
      <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
