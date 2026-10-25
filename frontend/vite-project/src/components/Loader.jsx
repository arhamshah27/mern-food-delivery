/**
 * Full-screen animated loading spinner.
 */
const Loader = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="flex flex-col items-center gap-4">
                {/* Animated rings */}
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
                    <div
                        className="absolute inset-2 rounded-full border-4 border-transparent border-t-fuchsia-400 animate-spin"
                        style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                    />
                    <div
                        className="absolute inset-4 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"
                        style={{ animationDuration: "1.5s" }}
                    />
                </div>
                <p className="text-sm font-medium text-white/60 animate-pulse">
                    Loading…
                </p>
            </div>
        </div>
    );
};

export default Loader;
