import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {title && (
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Owner workspace</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">{title}</h2></div>
        )}
        {children}
      </main>
    </div>
  );
}
