export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Thank you for signing up!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                Check your email to confirm
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
