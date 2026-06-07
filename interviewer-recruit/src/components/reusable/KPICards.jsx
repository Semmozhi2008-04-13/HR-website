import React from 'react';
import './KPICards.css';

export default function KPICard({title, value, icon: Icon, variant}){
    return(
        <div className={`kpi-cards ${variant}`} >
            <div className='kpi-content-wrap'>
                {Icon && (
                    <div className={`kpi-icon-container ${variant}`}>
                        <Icon size={24} />
                    </div>
                )}
            </div>

            <div className='kpi-text'>
                <span className='kpi-title'>{title}</span>
                <h3 className='kpi-subtext'>{value}</h3>
            </div>

        </div>
    );
}