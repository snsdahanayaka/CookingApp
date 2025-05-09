import React from 'react';
import '../../styles/skeleton.css';

export const Skeleton = ({ width, height, borderRadius, className }) => {
  return (
    <div 
      className={`skeleton-pulse ${className || ''}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px',
        borderRadius: borderRadius || '4px'
      }}
    />
  );
};

export const PostCardSkeleton = () => {
  return (
    <div className="card post-card skeleton-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Skeleton width="40px" height="40px" borderRadius="50%" className="me-2" />
          <div>
            <Skeleton width="100px" height="18px" className="mb-1" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
        <Skeleton width="24px" height="24px" borderRadius="50%" />
      </div>
      
      <Skeleton className="skeleton-media" height="200px" />
      
      <div className="card-body">
        <Skeleton className="mb-3" height="24px" />
        <Skeleton className="mb-2" />
        <Skeleton className="mb-2" />
        <Skeleton className="mb-4" width="85%" />
        
        <div className="d-flex gap-2 mb-3">
          <Skeleton width="60px" height="24px" borderRadius="50px" />
          <Skeleton width="80px" height="24px" borderRadius="50px" />
          <Skeleton width="70px" height="24px" borderRadius="50px" />
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <Skeleton width="60px" height="30px" />
            <Skeleton width="60px" height="30px" />
            <Skeleton width="60px" height="30px" />
          </div>
          <Skeleton width="100px" height="34px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
};

export const PostFeedSkeleton = ({ count = 3 }) => {
  return (
    <div className="skeleton-feed">
      {[...Array(count)].map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};
