export const Footer = () => {
    return <footer className="mt-12 border-t border-white/5 pt-12 text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
            <p className="text-xs font-bold tracking-widest text-zinc-600 uppercase">
              Designed & Built by <span className="text-gold mx-1">huzaif ahmad shah</span>
            </p>
            <p className="mt-2 text-[10px] text-zinc-700">
               © {new Date().getFullYear()} Pocket Optimizer. Precision is our priority.
            </p>
          </footer>
};