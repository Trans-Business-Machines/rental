import React from "react";

interface SearchNotFoundProps {
  title: string;
  className?: string;
  icon: React.ComponentType<{ className: string }>;
}

function SearchNotFound({ title, icon: Icon, className }: SearchNotFoundProps) {
  return (
    <div className={`text-center py-8c ${className} `}>
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">
        Try adjusting your search criteria.
      </p>
    </div>
  );
}

export { SearchNotFound };
