/**
 * Coming Soon Placeholder Component
 * Displayed for features under development
 */

interface ComingSoonPlaceholderProps {
  activeMenu: string;
  roleColor: string;
}

export function ComingSoonPlaceholder({ activeMenu, roleColor }: ComingSoonPlaceholderProps) {
  return (
    <div className="py-20 text-center">
      <div className="mb-6 inline-block rounded-full bg-gradient-to-br from-blue-100 to-green-100 p-12">
        <div className="text-4xl">🚀</div>
      </div>
      <h2
        className={`bg-gradient-to-r text-3xl font-bold ${roleColor} mb-2 bg-clip-text text-transparent`}
      >
        Coming Soon
      </h2>
      <p className="text-gray-600">
        The <span className="font-semibold">{activeMenu}</span> section is under development.
      </p>
    </div>
  );
}
