import React from "react";

interface ItemsNotFoundProps {
  title: string;
  message: string;
  icon: React.ComponentType<{ className: string }>;
}

function ItemsNotFound({ title, message, icon: Icon }: ItemsNotFoundProps) {
  return (
    <div className="text-center py-8">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export { ItemsNotFound };
