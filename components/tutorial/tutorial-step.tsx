export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <input
        type="checkbox"
        id={title}
        name={title}
        className="absolute top-[3px] mr-2 peer h-4 w-4 shrink-0 rounded-sm border border-gray-200 dark:border-gray-800 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=checked]:text-gray-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=checked]:bg-gray-50 dark:data-[state=checked]:text-gray-900"
      />
      <label
        htmlFor={title}
        className="relative text-base text-gray-950 dark:text-gray-50 peer-checked:line-through font-medium cursor-pointer"
      >
        <span className="ml-8">{title}</span>
        <div className="ml-8 text-sm peer-checked:line-through font-normal text-gray-600 dark:text-gray-400">
          {children}
        </div>
      </label>
    </li>
  );
}
