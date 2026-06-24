import React from 'react';

const CategoryCard = ({ icon, title, jobs, bgColor, iconColor }) => {
  return (
    <div className="col-6 col-sm-4 col-md-3 col-lg-1-5 flex-shrink-0" style={{ width: '200px' }}>
      <div className="cat-card">
        <div 
          className="cat-icon-circle" 
          style={{ backgroundColor: bgColor, color: iconColor }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
        <h5>
          <a href="#" className="text-dark">{title}</a>
        </h5>
        <div className="cat-jobs-count">{jobs} Jobs</div>
      </div>
    </div>
  );
};

const JobCategoryCard = () => {
  const categories = [
    {
      id: 1,
      icon: 'bi-laptop',
      title: 'IT & Software',
      jobs: 542,
      bgColor: '#e3f2fd',
      iconColor: '#1e88e5'
    },
    {
      id: 2,
      icon: 'bi-graph-up-arrow',
      title: 'Sales & Marketing',
      jobs: 432,
      bgColor: '#fff3e0',
      iconColor: '#fb8c00'
    },
    {
      id: 3,
      icon: 'bi-wallet2',
      title: 'Accounts & Finance',
      jobs: 328,
      bgColor: '#e8f5e9',
      iconColor: '#43a047'
    },
    {
      id: 4,
      icon: 'bi-headset',
      title: 'Customer Support',
      jobs: 287,
      bgColor: '#f3e5f5',
      iconColor: '#8e24aa'
    },
    {
      id: 5,
      icon: 'bi-gear',
      title: 'Engineering',
      jobs: 245,
      bgColor: '#e0f2f1',
      iconColor: '#00897b'
    },
    {
      id: 6,
      icon: 'bi-people',
      title: 'HR & Admin',
      jobs: 198,
      bgColor: '#ffebee',
      iconColor: '#e53935'
    },
    {
      id: 7,
      icon: 'bi-palette',
      title: 'Designing',
      jobs: 156,
      bgColor: '#f9fbe7',
      iconColor: '#c0ca33'
    }
  ];

  return (
    <div className="row g-3 flex-nowrap overflow-x-hidden" id="catContainer">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          icon={category.icon}
          title={category.title}
          jobs={category.jobs}
          bgColor={category.bgColor}
          iconColor={category.iconColor}
        />
      ))}
    </div>
  );
};

export default JobCategoryCard;