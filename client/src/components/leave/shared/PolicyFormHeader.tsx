interface PolicyFormHeaderProps {
  mode: "create" | "view" | "edit";
}

export function PolicyFormHeader({ mode }: PolicyFormHeaderProps) {
  const titles = {
    view: "View Leave Allocation Policy",
    edit: "Edit Leave Allocation Policy",
    create: "Create Leave Allocation Policy",
  };

  const descriptions = {
    view: "Review leave policy details",
    edit: "Update leave policy for your organization",
    create: "Set up leave policies for your organization with role-specific allocations",
  };

  return (
    <div className="mb-8 mt-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {titles[mode]}
      </h1>
      <p className="text-gray-600 text-base">
        {descriptions[mode]}
      </p>
    </div>
  );
}
